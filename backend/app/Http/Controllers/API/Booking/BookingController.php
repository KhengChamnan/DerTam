<?php

namespace App\Http\Controllers\API\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
use App\Models\Payment\Payment;
use App\Models\Payment\PaymentMethod;
use App\Services\AbaPayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    protected $abaService;

    public function __construct(AbaPayWayService $abaService)
    {
        $this->abaService = $abaService;
    }

    /**
     * Calculate nights between check-in and check-out dates
     */
    private function calculateNights(string $checkIn, string $checkOut): int
    {
        $checkInDate = \Carbon\Carbon::parse($checkIn);
        $checkOutDate = \Carbon\Carbon::parse($checkOut);
        return $checkInDate->diffInDays($checkOutDate);
    }

    /**
     * Calculate total booking amount from booking items
     */
    private function calculateTotalAmount(array $bookingItems, int $nights): float
    {
        $total = 0;
        foreach ($bookingItems as $item) {
            $total += $item['unit_price'] * $item['quantity'] * $nights;
        }
        return $total;
    }

    /**
     * Create booking items and hotel details
     */
    private function createBookingItems(int $bookingId, array $bookingItems, string $checkIn, string $checkOut, int $nights): array
    {
        $createdItems = [];
        
        foreach ($bookingItems as $item) {
            $itemTotalPrice = $item['unit_price'] * $item['quantity'] * $nights;
            
            $bookingItem = BookingItem::create([
                'booking_id' => $bookingId,
                'item_type' => 'hotel_room',
                'item_id' => $item['room_property_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $itemTotalPrice,
            ]);

            $hotelDetail = BookingHotelDetail::create([
                'booking_item_id' => $bookingItem->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'nights' => $nights,
            ]);

            $createdItems[] = [
                'booking_item_id' => $bookingItem->id,
                'room_property_id' => $item['room_property_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total_price' => $itemTotalPrice,
                'check_in' => $hotelDetail->check_in,
                'check_out' => $hotelDetail->check_out,
                'nights' => $hotelDetail->nights,
            ];
        }

        return $createdItems;
    }

    /**
     * Prepare items array for ABA PayWay
     */
    private function prepareAbaItems(array $bookingItems, int $nights): array
    {
        $abaItems = [];
        
        foreach ($bookingItems as $item) {
            $abaItems[] = [
                'name' => "Hotel Room Type #{$item['room_property_id']}",
                'quantity' => $item['quantity'] * $nights,
                'price' => (float)$item['unit_price']
            ];
        }

        return $abaItems;
    }

    /**
     * Create payment record
     */
    private function createPayment(int $bookingId, float $amount, string $currency): Payment
    {
        $paymentMethod = PaymentMethod::firstOrCreate(
            ['provider_key' => 'aba_payway'],
            [
                'name' => 'ABA PayWay',
                'is_active' => true,
            ]
        );

        // Generate unique transaction ID (max 20 characters for ABA PayWay)
        // Format: BK{bookingId}{uniqid} - similar to PaymentExample.php
        $uniqPart = strtoupper(uniqid());
        $tranId = 'BK' . $bookingId . $uniqPart;
        
        // Ensure it doesn't exceed 20 characters
        if (strlen($tranId) > 20) {
            // Trim from the middle of uniqid to keep booking ID intact
            $maxUniqLength = 20 - 2 - strlen($bookingId); // 20 - 'BK' - bookingId length
            $uniqPart = substr($uniqPart, 0, $maxUniqLength);
            $tranId = 'BK' . $bookingId . $uniqPart;
        }

        return Payment::create([
            'booking_id' => $bookingId,
            'payment_method_id' => $paymentMethod->id,
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
            'provider_transaction_id' => $tranId,  // Changed from 'transaction_id' to 'provider_transaction_id'
        ]);
    }

    /**
     * Create a new hotel booking with payment
     * POST /api/booking/create
     */
    public function createHotelBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'booking_items' => 'required|array|min:1',
            'booking_items.*.room_property_id' => 'required|exists:room_properties,room_properties_id',
            'booking_items.*.quantity' => 'required|integer|min:1',
            'booking_items.*.unit_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|in:USD,KHR',
            'payment_option' => 'nullable|string|in:abapay_khqr,abapay_khqr_deeplink,abapay_deeplink',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $currency = $request->currency ?? 'USD';
            $nights = $this->calculateNights($request->check_in, $request->check_out);
            $totalAmount = $this->calculateTotalAmount($request->booking_items, $nights);

            // Create main booking
            $booking = Booking::create([
                'user_id' => auth()->id(),
                'total_amount' => $totalAmount,
                'currency' => $currency,
                'status' => 'pending',
            ]);

            // Create booking items and hotel details
            $createdItems = $this->createBookingItems(
                $booking->id,
                $request->booking_items,
                $request->check_in,
                $request->check_out,
                $nights
            );

            // Create payment
            $payment = $this->createPayment($booking->id, $totalAmount, $currency);

            // Process ABA PayWay payment
            $abaResponse = $this->processAbaPayment($request, $payment, $nights);

            if (!$abaResponse['success']) {
                DB::rollBack();
                
                // Log detailed error information
                Log::error('ABA PayWay payment failed', [
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id,
                    'transaction_id' => $payment->provider_transaction_id,
                    'aba_response' => $abaResponse,
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment with ABA PayWay',
                    'error' => $abaResponse['error'] ?? 'Unknown error',
                    'details' => $abaResponse['data'] ?? null,
                    'status_code' => $abaResponse['status_code'] ?? null,
                ], 500);
            }

            // Payment initiated successfully - payload will be saved when status is checked in callback
            DB::commit();

            return $this->buildSuccessResponse($booking, $payment, $createdItems, $request, $nights, $abaResponse['data']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Hotel booking creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating hotel booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process ABA PayWay payment
     */
    private function processAbaPayment(Request $request, Payment $payment, int $nights): array
    {
        $user = auth()->user();
        $abaItems = $this->prepareAbaItems($request->booking_items, $nights);

        $abaData = [
            'tran_id' => $payment->provider_transaction_id,  // Changed from transaction_id
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'payment_option' => $request->payment_option ?? 'abapay_khqr_deeplink',
            'firstname' => $request->firstname ?? $user->name ?? 'Customer',
            'lastname' => $request->lastname ?? '',
            'email' => $request->email ?? $user->email ?? 'customer@example.com',
            'phone' => $request->phone ?? $user->phone ?? '012345678',
            'return_deeplink' => $request->return_deeplink ?? 'myapp://payment',
            'lifetime' => $request->lifetime ?? 10,
            'items' => $abaItems,
        ];

        // Log transaction ID details
        Log::info('Booking Payment - Transaction ID Details', [
            'transaction_id' => $payment->provider_transaction_id,  // Changed from transaction_id
            'length' => strlen($payment->provider_transaction_id),
            'is_alphanumeric' => ctype_alnum($payment->provider_transaction_id),
            'booking_id' => $payment->booking_id,
            'amount' => $payment->amount,
        ]);

        return $this->abaService->createPurchase($abaData);
    }

    /**
     * Build success response
     */
    private function buildSuccessResponse(Booking $booking, Payment $payment, array $createdItems, Request $request, int $nights, array $abaData): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Hotel booking created successfully',
            'data' => [
                'booking' => [
                    'id' => $booking->id,
                    'total_amount' => $booking->total_amount,
                    'currency' => $booking->currency,
                    'status' => $booking->status,
                    'check_in' => $request->check_in,
                    'check_out' => $request->check_out,
                    'nights' => $nights,
                    'booking_items' => $createdItems,
                ],
                // Return complete ABA PayWay response
                'aba_response' => $abaData,
            ],
        ], 201);
    }

    /**
     * Get user's bookings
     * GET /api/booking/my-bookings
     */
    public function getMyBookings(Request $request)
    {
        try {
            $userId = auth()->id();
            $status = $request->query('status'); // pending, confirmed, cancelled, refunded

            $query = Booking::where('user_id', $userId)
                ->with([
                    'bookingItems.hotelDetails',
                    'bookingItems.roomProperty.property',
                    'payments' => function($q) {
                        $q->latest();
                    }
                ]);

            if ($status) {
                $query->where('status', $status);
            }

            $bookings = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $bookings,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch user bookings', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bookings',
            ], 500);
        }
    }

    /**
     * Get booking details by ID
     * GET /api/booking/{id}
     */
    public function getBookingDetails($id)
    {
        try {
            $userId = auth()->id();
            
            $booking = Booking::where('id', $id)
                ->where('user_id', $userId)
                ->with([
                    'bookingItems.hotelDetails',
                    'bookingItems.roomProperty.property',
                    'payments.paymentMethod',
                    'payments.paymentEvents' => function($q) {
                        $q->latest()->limit(5);
                    }
                ])
                ->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $booking,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch booking details', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking details',
            ], 500);
        }
    }

    /**
     * Cancel a booking
     * POST /api/booking/{id}/cancel
     */
    public function cancelBooking($id)
    {
        DB::beginTransaction();
        try {
            $userId = auth()->id();
            
            $booking = Booking::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                ], 404);
            }

            if ($booking->isCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking is already cancelled',
                ], 400);
            }

            if ($booking->isRefunded()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking has been refunded',
                ], 400);
            }

            // Update booking status
            $booking->update(['status' => 'cancelled']);

            // Mark payments as failed if they are still pending
            $booking->payments()->where('status', 'pending')->update(['status' => 'failed']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled successfully',
                'data' => [
                    'booking_id' => $booking->id,
                    'status' => $booking->status,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to cancel booking', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel booking',
            ], 500);
        }
    }

 
}
