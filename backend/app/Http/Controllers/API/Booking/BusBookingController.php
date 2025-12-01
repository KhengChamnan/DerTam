<?php

namespace App\Http\Controllers\API\Booking;

use App\Http\Controllers\API\Payment\BasePaymentController;
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Services\AbaPayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Bus\BusSeat;
use App\Models\Bus\SeatBooking;
class BusBookingController extends BasePaymentController
{
    public function __construct(AbaPayWayService $abaService)
    {
        parent::__construct($abaService);
    }

    /**
     * Create a new bus booking with payment
     * POST /api/booking/bus/create
     */
    public function createBusBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:bus_schedules,id',
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'required|exists:bus_seats,id',
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
            $schedule = \App\Models\Bus\BusSchedule::with(['bus', 'route'])->findOrFail($request->schedule_id);
            
            // Verify seats belong to the bus in this schedule
            $validSeatIds = BusSeat::where('bus_id', $schedule->bus_id)
                ->whereIn('id', $request->seat_ids)
                ->pluck('id')
                ->toArray();

            if (count($validSeatIds) !== count($request->seat_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some seats do not belong to this bus',
                ], 400);
            }

            // Check if seats are already booked for this schedule (only confirmed bookings block seats)
            $alreadyBooked = SeatBooking::where('schedule_id', $request->schedule_id)
                ->whereIn('seat_id', $request->seat_ids)
                ->whereHas('booking', function($query) {
                    $query->where('status', 'confirmed');
                })
                ->exists();

            if ($alreadyBooked) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more seats are already booked for this schedule',
                ], 400);
            }

            $currency = 'USD'; // Fixed currency
            $pricePerSeat = (float)$schedule->price;
            $totalAmount = $pricePerSeat * count($request->seat_ids);

            // Create main booking
            $booking = Booking::create([
                'user_id' => auth()->id(),
                'total_amount' => $totalAmount,
                'currency' => $currency,
                'status' => 'pending',
                'expires_at' => now()->addMinutes(10),
            ]);

            // Create booking items for each seat
            $createdItems = [];
            foreach ($request->seat_ids as $seatId) {
                $bookingItem = BookingItem::create([
                    'booking_id' => $booking->id,
                    'item_type' => 'bus_seat',
                    'item_id' => $seatId,
                    'quantity' => 1,
                    'unit_price' => $pricePerSeat,
                    'total_price' => $pricePerSeat,
                ]);

                // Create seat booking record
                SeatBooking::create([
                    'booking_id' => $booking->id,
                    'schedule_id' => $request->schedule_id,
                    'seat_id' => $seatId,
                    'price' => $pricePerSeat,
                ]);

                $seat = BusSeat::find($seatId);
                $createdItems[] = [
                    'booking_item_id' => $bookingItem->id,
                    'seat_id' => $seatId,
                    'seat_number' => $seat->column_label . $seat->row,
                    'price' => $pricePerSeat,
                ];
            }

            // Create payment
            $payment = $this->createPayment($booking->id, $totalAmount, $currency);

            // Prepare ABA items
            $abaItems = [[
                'name' => "Bus Ticket: {$schedule->route->from_location} → {$schedule->route->to_location}",
                'quantity' => count($request->seat_ids),
                'price' => $pricePerSeat
            ]];

            // Process ABA PayWay payment
            $abaResponse = $this->processAbaPayment($request, $payment, $abaItems);

            if (!$abaResponse['success']) {
                DB::rollBack();
                Log::error('ABA PayWay payment failed for bus booking', [
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id,
                    'aba_response' => $abaResponse,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment with ABA PayWay',
                    'error' => $abaResponse['error'] ?? 'Unknown error',
                ], 500);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bus booking created successfully',
                'data' => [
                    'booking' => [
                        'id' => $booking->id,
                        'total_amount' => $booking->total_amount,
                        'currency' => $booking->currency,
                        'status' => $booking->status,
                        'schedule' => [
                            'id' => $schedule->id,
                            'route' => "{$schedule->route->from_location} → {$schedule->route->to_location}",
                            'departure_time' => $schedule->departure_time,
                            'bus_name' => $schedule->bus->bus_name,
                        ],
                        'seats' => $createdItems,
                    ],
                    'aba_response' => $abaResponse['data'],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bus booking creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating bus booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
