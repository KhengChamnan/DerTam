<?php

namespace App\Http\Controllers\API\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment\Payment;
use App\Models\Payment\PaymentMethod;
use App\Services\AbaPayWayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BasePaymentController extends Controller
{
    protected $abaService;

    public function __construct(AbaPayWayService $abaService)
    {
        $this->abaService = $abaService;
    }

    /**
     * Create payment record (shared utility for all booking types)
     */
    protected function createPayment(int $bookingId, float $amount, string $currency): Payment
    {
        $paymentMethod = PaymentMethod::firstOrCreate(
            ['provider_key' => 'aba_payway'],
            [
                'name' => 'ABA PayWay',
                'is_active' => true,
            ]
        );

        // Generate unique transaction ID (max 20 characters for ABA PayWay)
        // Format: BK{bookingId}{uniqid}
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
            'provider_transaction_id' => $tranId,
        ]);
    }

    /**
     * Process ABA PayWay payment (shared utility for all booking types)
     */
    protected function processAbaPayment(Request $request, Payment $payment, array $abaItems): array
    {
        $user = auth()->user();

        $abaData = [
            'tran_id' => $payment->provider_transaction_id,
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
            'transaction_id' => $payment->provider_transaction_id,
            'length' => strlen($payment->provider_transaction_id),
            'is_alphanumeric' => ctype_alnum($payment->provider_transaction_id),
            'booking_id' => $payment->booking_id,
            'amount' => $payment->amount,
        ]);

        return $this->abaService->createPurchase($abaData);
    }
}
