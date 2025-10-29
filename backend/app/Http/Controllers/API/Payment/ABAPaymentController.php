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

			// For testing: ensure minimum amount for KHR to avoid gateway validation errors
			$currency = Config::get('services.aba.default_currency', 'KHR');
			$amount = (float) $booking->total_amount;
			if ($currency === 'KHR' && $amount < 100) {
				$amount = 100.0;
			}

			$result = $client->generateQr([
				'tran_id' => $tranId,
				'amount' => $amount,
				'currency' => $currency,
				'items' => $items,
				'first_name' => $booking->full_name,
				'email' => $booking->email ?? '',
				'phone' => $booking->mobile ?? '',
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

    public function webhook(Request $request)
    {
        try {
            $payload = $request->json()->all();

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
            if (!$tranId) {
                return response()->json(['message' => 'tran_id missing'], 400);
            }

            $statusCode = (string) ($payload['status']['code'] ?? ($payload['code'] ?? ''));
            $paymentSuccess = $statusCode === '0';

            $booking = BookingDetail::where('tran_id', $tranId)->first();
            if (!$booking) {
                return response()->json(['message' => 'Booking not found for tran_id'], 404);
            }

            $update = [
                'payment_status' => $paymentSuccess ? 'success' : 'failed',
            ];
            if ($paymentSuccess) {
                $update['status'] = 'paid';
                $update['payment_date'] = now();
            }
            $booking->update($update);

            return response()->json(['message' => 'Webhook processed', 'booking_id' => $booking->booking_id]);
        } catch (\Throwable $e) {
            Log::error('ABA webhook failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['message' => 'Webhook error'], 500);
        }
    }
}


