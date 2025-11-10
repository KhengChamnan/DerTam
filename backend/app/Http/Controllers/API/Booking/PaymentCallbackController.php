<?php

namespace App\Http\Controllers\API\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking\Booking;
use App\Models\Payment\Payment;
use App\Services\AbaPayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentCallbackController extends Controller
{
    protected $abaService;

    public function __construct(AbaPayWayService $abaService)
    {
        $this->abaService = $abaService;
    }

    /**
     * Handle ABA PayWay callback (return URL)
     * POST /api/payments/aba/return
     * Response format: {"tran_id":"BK1469118D0095B81","apv":"133218","status":0}
     * Status: 0 = success, other = failed
     */
    public function handleCallback(Request $request)
    {
        // Log incoming callback with full details
        Log::info('ABA PayWay Booking Callback Received', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'all_data' => $request->all(),
            'query_params' => $request->query(),
            'post_data' => $request->post(),
            'headers' => $request->headers->all(),
            'raw_content' => $request->getContent(),
        ]);

        DB::beginTransaction();
        try {
            $tranId = $request->input('tran_id');
            $status = $request->input('status');
            $apv = $request->input('apv'); // ABA Payment Voucher

            // Find payment record
            $payment = Payment::where('provider_transaction_id', $tranId)
                ->with('booking')
                ->first();

            if (!$payment) {
                Log::error('Payment not found', [
                    'tran_id' => $tranId,
                    'request_data' => $request->all(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found',
                ], 404);
            }

            // Log payment event
            $payment->paymentEvents()->create([
                'event_type' => 'callback',
                'payload' => $request->all(),
            ]);

            // Check payment status
            if ($status == 0) {
                // Payment successful
                $payment->update(['status' => 'success']);
                $payment->booking->update(['status' => 'confirmed']);

                Log::info('Payment successful', [
                    'tran_id' => $tranId,
                    'booking_id' => $payment->booking_id,
                    'apv' => $apv,
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Payment completed successfully',
                    'data' => [
                        'booking_id' => $payment->booking_id,
                        'booking_status' => $payment->booking->status,
                        'payment_status' => $payment->status,
                    ],
                ]);
            } else {
                // Payment failed
                $payment->update(['status' => 'failed']);

                Log::warning('Payment failed', [
                    'tran_id' => $tranId,
                    'booking_id' => $payment->booking_id,
                    'status' => $status,
                ]);

                DB::commit();

                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed',
                    'data' => [
                        'booking_id' => $payment->booking_id,
                        'payment_status' => $payment->status,
                    ],
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Callback processing failed',
            ], 500);
        }
    }

    /**
     * Handle ABA PayWay cancel callback
     * POST /api/booking/payment/cancel
     * This endpoint MUST be publicly accessible (no auth middleware)
     */
    public function handleCancel(Request $request)
    {
        Log::info('ABA PayWay Booking Cancel Callback', ['data' => $request->all()]);

        DB::beginTransaction();
        try {
            $tranId = $request->input('tran_id');
            
            if ($tranId) {
                $payment = Payment::where('provider_transaction_id', $tranId)
                    ->with('booking')
                    ->first();
                    
                if ($payment && in_array($payment->status, ['pending', 'processing'])) {
                    // Update payment status
                    $payment->update(['status' => 'failed']);

                    // Log cancel event
                    $payment->paymentEvents()->create([
                        'event_type' => 'timeout',
                        'payload' => [
                            'message' => 'Payment cancelled by user',
                            'callback_data' => $request->all(),
                        ],
                    ]);

                    Log::info('Payment cancelled', [
                        'tran_id' => $tranId,
                        'booking_id' => $payment->booking_id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment cancelled',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PayWay cancel callback failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Cancel callback processing failed',
            ], 500);
        }
    }

    /**
     * Check payment status for a booking
     * GET /api/booking/payment/status/{transactionId}
     */
    public function checkPaymentStatus($transactionId)
    {
        try {
            $payment = Payment::where('provider_transaction_id', $transactionId)
                ->with(['booking', 'paymentMethod'])
                ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found',
                ], 404);
            }

            // Verify user owns this booking
            if ($payment->booking->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_id' => $payment->provider_transaction_id,
                    'payment_status' => $payment->status,
                    'booking_status' => $payment->booking->status,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'payment_method' => $payment->paymentMethod->name,
                    'created_at' => $payment->created_at,
                    'updated_at' => $payment->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to check payment status', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to check payment status',
            ], 500);
        }
    }

    /**
     * Retry payment for a booking
     * POST /api/booking/{bookingId}/retry-payment
     */
    public function retryPayment($bookingId, Request $request)
    {
        $validator = \Validator::make($request->all(), [
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
            $userId = auth()->id();
            
            $booking = Booking::where('id', $bookingId)
                ->where('user_id', $userId)
                ->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found',
                ], 404);
            }

            if ($booking->isConfirmed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking is already confirmed',
                ], 400);
            }

            if (!$booking->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot retry payment for this booking',
                ], 400);
            }

            // Get payment method
            $paymentMethod = \App\Models\Payment\PaymentMethod::where('code', 'aba_payway')->first();

            if (!$paymentMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method not available',
                ], 500);
            }

            // Generate new transaction ID
            $uniqPart = strtoupper(uniqid());
            $tranId = 'BK' . $booking->id . $uniqPart;
            
            // Ensure it doesn't exceed 20 characters
            if (strlen($tranId) > 20) {
                $maxUniqLength = 20 - 2 - strlen($booking->id);
                $uniqPart = substr($uniqPart, 0, $maxUniqLength);
                $tranId = 'BK' . $booking->id . $uniqPart;
            }

            // Create new payment record
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'payment_method_id' => $paymentMethod->id,
                'amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'status' => 'pending',
                'provider_transaction_id' => $tranId,
            ]);

            // Prepare data for ABA API
            $user = auth()->user();
            $abaData = [
                'tran_id' => $tranId,
                'amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'payment_option' => $request->payment_option ?? 'abapay_khqr_deeplink',
                'firstname' => $request->firstname ?? $user->name ?? 'Customer',
                'lastname' => $request->lastname ?? '',
                'email' => $request->email ?? $user->email ?? 'customer@example.com',
                'phone' => $request->phone ?? $user->phone ?? '012345678',
                'return_deeplink' => $request->return_deeplink ?? 'myapp://payment',
                'lifetime' => $request->lifetime ?? 10,
                'items' => [
                    [
                        'name' => "Hotel Booking #{$booking->id}",
                        'quantity' => 1,
                        'price' => (float)$booking->total_amount
                    ]
                ],
            ];

            // Send purchase request to ABA PayWay
            $abaResponse = $this->abaService->createPurchase($abaData);

            if (!$abaResponse['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment with ABA PayWay',
                    'error' => $abaResponse['error'] ?? 'Unknown error',
                ], 500);
            }

            // Extract payment details from ABA response
            $responseData = $abaResponse['data'];
            
            // Payment initiated successfully - payload will be saved when status is checked in callback
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment retry initiated successfully',
                'data' => [
                    'payment' => [
                        'id' => $payment->id,
                        'transaction_id' => $tranId,
                        'amount' => $payment->amount,
                        'currency' => $payment->currency,
                        'status' => $payment->status,
                        'qr_string' => $responseData['qr_string'] ?? null,
                        'abapay_deeplink' => $responseData['abapay_deeplink'] ?? null,
                        'payment_option' => $request->payment_option ?? 'abapay_khqr_deeplink',
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment retry failed', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retry payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
