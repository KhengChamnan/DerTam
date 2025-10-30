<?php

namespace App\Http\Controllers\API\Payment;

use App\Http\Controllers\Controller;
use App\Models\Hotel\BookingDetail;
use App\Services\ABA\PayWayClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ABAPaymentController extends Controller
{
    public function initiateForBooking(Request $request, int $booking_id)
    {
        try {
            $booking = BookingDetail::find($booking_id);
            if (!$booking || $booking->user_id !== Auth::id()) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            if ($booking->status === 'paid' || $booking->payment_status === 'success') {
                return response()->json(['message' => 'Booking already paid'], 400);
            }

            // Build transaction id and persist
            $tranId = 'BK-' . $booking->booking_id . '-' . gmdate('YmdHis');
            $booking->tran_id = $tranId;
            $booking->save();

            $items = base64_encode(json_encode([
                ['name' => 'Booking ' . $booking->merchant_ref_no, 'quantity' => 1, 'price' => (float) $booking->total_amount],
            ]));

            $client = new PayWayClient();

            // Ensure minimum amount for KHR
            $currency = Config::get('services.aba.default_currency', 'KHR');
            $amount = (float) $booking->total_amount;
            if ($currency === 'KHR' && $amount < 100) {
                $amount = 100.0;
            }

            // Build URLs for payment flow
            $appUrl = rtrim(Config::get('app.url'), '/');
            $continueSuccessUrl = $appUrl . '/payment/success?booking_id=' . $booking->booking_id;
            $returnUrl = $appUrl . '/payment/return?booking_id=' . $booking->booking_id;
            $cancelUrl = $appUrl . '/payment/cancel?booking_id=' . $booking->booking_id;

            // Create payment in ABA portal
            $result = $client->purchase([
                'tran_id' => $tranId,
                'amount' => $amount,
                'currency' => $currency,
                'items' => $items,
                'first_name' => $booking->full_name,
                'email' => $booking->email ?? '',
                'phone' => $booking->mobile ?? '',
                'payment_option' => 'abapay_khqr_deeplink', // Returns JSON with QR and deeplink
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'continue_success_url' => $continueSuccessUrl,
            ]);

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Failed to initiate payment',
                    'error' => $result['raw']['status']['message'] ?? 'Unknown error',
                    'details' => $result['raw'] ?? null,
                ], 422);
            }

            return response()->json([
                'message' => 'Payment initiated',
                'data' => [
                    'booking_id' => $booking->booking_id,
                    'merchant_ref_no' => $booking->merchant_ref_no,
                    'tran_id' => $tranId,
                    'amount' => $result['amount'],
                    'currency' => $result['currency'],
                    'qrImage' => $result['qrImage'],
                    'abapay_deeplink' => $result['abapay_deeplink'],
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('ABA initiateForBooking failed', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Failed to initiate payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function checkTransactionStatus(Request $request, int $booking_id)
    {
        try {
            $booking = BookingDetail::find($booking_id);
            if (!$booking || $booking->user_id !== Auth::id()) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            if (!$booking->tran_id) {
                return response()->json(['message' => 'No transaction initiated for this booking'], 400);
            }

            $client = new PayWayClient();
            $result = $client->getTransactionDetail($booking->tran_id);

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Failed to retrieve transaction details',
                    'error' => $result['error'] ?? 'Unknown error',
                ], 422);
            }

            // Get the full ABA response
            $abaResponse = $result['data'];
            
            // Handle status - it might be a nested array like ['status']['code'] or just 'status'
            if (isset($abaResponse['status']) && is_array($abaResponse['status'])) {
                $statusCode = (string) ($abaResponse['status']['code'] ?? '');
            } else {
                $statusCode = (string) ($abaResponse['status'] ?? '');
            }
            
            // Also check payment_status_code from the data section
            if (isset($abaResponse['data']['payment_status_code'])) {
                $paymentStatusCode = (int) $abaResponse['data']['payment_status_code'];
                // payment_status_code: 0 = APPROVED
                if ($paymentStatusCode === 0) {
                    $booking->update([
                        'payment_status' => 'success',
                        'status' => 'paid',
                        'payment_date' => now(),
                    ]);
                } else {
                    $booking->update(['payment_status' => 'failed']);
                }
            } elseif (in_array($statusCode, ['0', '00'], true)) {
                $booking->update([
                    'payment_status' => 'success',
                    'status' => 'paid',
                    'payment_date' => now(),
                ]);
            } elseif ($statusCode === '2') {
                $booking->update(['payment_status' => 'failed']);
            }

            // Return the exact ABA response format
            return response()->json($abaResponse, 200);
        } catch (\Throwable $e) {
            Log::error('ABA checkTransactionStatus failed', [
                'booking_id' => $booking_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Failed to check transaction status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        try {
            $payload = $request->json()->all();

            // Log the full webhook payload for debugging
            Log::info('ABA Webhook Received', [
                'payload' => $payload,
                'headers' => $request->headers->all(),
            ]);

            // Optional shared-secret verification against raw body
            $verifyKey = Config::get('services.aba.webhook_verify_key');
            if ($verifyKey) {
                $signature = $request->header('X-ABA-Signature');
                $computed = base64_encode(hash_hmac('sha256', $request->getContent(), $verifyKey, true));
                if (!$signature || !hash_equals($signature, $computed)) {
                    return response()->json(['message' => 'Invalid signature'], 401);
                }
            }

            // Try to get transaction id from various possible keys
            $tranId = $payload['tran_id'] ?? ($payload['tranId'] ?? ($payload['transactionId'] ?? null));
            
            // Also check in status object
            if (!$tranId && isset($payload['status']['tran_id'])) {
                $tranId = $payload['status']['tran_id'];
            }
            
            if (!$tranId) {
                Log::warning('ABA Webhook: tran_id missing', ['payload' => $payload]);
                return response()->json(['message' => 'tran_id missing'], 400);
            }

            $booking = BookingDetail::where('tran_id', $tranId)->first();
            if (!$booking) {
                Log::warning('ABA Webhook: Booking not found', ['tran_id' => $tranId]);
                return response()->json(['message' => 'Booking not found for tran_id'], 404);
            }

            // Check the actual payment status, not just the API response status
            // payment_status_code: 0 = APPROVED, 1 = PENDING, 2 = FAILED/DECLINED
            $paymentStatusCode = null;
            $paymentStatus = null;
            
            if (isset($payload['data']['payment_status_code'])) {
                $paymentStatusCode = (int) $payload['data']['payment_status_code'];
                $paymentStatus = $payload['data']['payment_status'] ?? null;
            }

            // Fallback to checking status.code (for backwards compatibility)
            $statusCode = (string) ($payload['status']['code'] ?? ($payload['code'] ?? ''));

            // Determine payment success based on payment_status_code (primary) or status code (fallback)
            if ($paymentStatusCode !== null) {
                // Use payment_status_code: 0 = APPROVED
                $paymentSuccess = ($paymentStatusCode === 0 && $paymentStatus === 'APPROVED');
                $isPending = ($paymentStatusCode === 1);
            } else {
                // Fallback to status.code: '0' or '00' = Success
                $paymentSuccess = in_array($statusCode, ['0', '00'], true);
                $isPending = false;
            }

            // Update booking based on payment status
            if ($paymentSuccess) {
                $update = [
                    'payment_status' => 'success',
                    'status' => 'paid',
                    'payment_date' => now(),
                ];
                Log::info('ABA Webhook: Payment Approved', [
                    'tran_id' => $tranId,
                    'booking_id' => $booking->booking_id,
                    'payment_status_code' => $paymentStatusCode,
                ]);
            } elseif ($isPending) {
                $update = [
                    'payment_status' => 'pending',
                ];
                Log::info('ABA Webhook: Payment Pending', [
                    'tran_id' => $tranId,
                    'booking_id' => $booking->booking_id,
                    'payment_status_code' => $paymentStatusCode,
                ]);
            } else {
                $update = [
                    'payment_status' => 'failed',
                ];
                Log::warning('ABA Webhook: Payment Failed', [
                    'tran_id' => $tranId,
                    'booking_id' => $booking->booking_id,
                    'payment_status_code' => $paymentStatusCode,
                    'status_code' => $statusCode,
                ]);
            }

            $booking->update($update);

            return response()->json([
                'message' => 'Webhook processed',
                'booking_id' => $booking->booking_id,
                'payment_status' => $booking->fresh()->payment_status,
            ]);
        } catch (\Throwable $e) {
            Log::error('ABA webhook failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Webhook error'], 500);
        }
    }
}


