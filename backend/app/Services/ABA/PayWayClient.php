<?php

namespace App\Services\ABA;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayWayClient
{
    /**
     * Initiate payment with ABA PayWay.
     * If ABA_USE_PURCHASE=true, registers a real transaction via /purchase endpoint
     * so it appears in the sandbox merchant portal and triggers webhooks.
     * Otherwise, uses /generate-qr for QR-only testing.
     */
    public function generateQr(array $params): array
    {
        $merchantId = Config::get('services.aba.merchant_id');
        $apiKey = Config::get('services.aba.api_key');
        $usePurchase = (bool) Config::get('services.aba.use_purchase', false);
        $qrEndpoint = Config::get('services.aba.qr_endpoint');
        $purchaseEndpoint = Config::get('services.aba.purchase_endpoint');
        $endpoint = $usePurchase ? $purchaseEndpoint : $qrEndpoint;

        $defaultCurrency = Config::get('services.aba.default_currency', 'KHR');
        $defaultLifetime = (int) Config::get('services.aba.default_lifetime', 10);
        $qrTemplate = Config::get('services.aba.qr_image_template', 'template3_color');

        $reqTime = $params['req_time'] ?? gmdate('YmdHis');
        $tranId = $params['tran_id'];
        $amount = (float) $params['amount'];
        $currency = strtoupper($params['currency'] ?? $defaultCurrency);

        // ✅ ABA expects different amount formats per currency
        $amountForHash = $currency === 'KHR'
            ? number_format($amount, 0, '.', '')
            : number_format($amount, 2, '.', '');

        $purchaseType = $params['purchase_type'] ?? 'purchase';
        $paymentOption = $params['payment_option'] ?? 'abapay_khqr';
        $firstName = $params['first_name'] ?? '';
        $lastName = $params['last_name'] ?? '';

        // Split name if full name is passed in first_name only
        if ($firstName && !$lastName && str_contains($firstName, ' ')) {
            [$splitFirst, $splitLast] = array_pad(explode(' ', trim($firstName), 2), 2, '');
            $firstName = $splitFirst;
            $lastName = $splitLast;
        }

        $email = $params['email'] ?? '';
        $phone = $params['phone'] ?? '';
        $items = $params['items'] ?? '';
        $customFields = $params['custom_fields'] ?? '';
        $returnParams = $params['return_params'] ?? '';
        $payout = $params['payout'] ?? '';
        $lifetime = isset($params['lifetime']) ? (int) $params['lifetime'] : $defaultLifetime;
        $qrImageTemplate = $params['qr_image_template'] ?? $qrTemplate;

        // ✅ Callback URL (must be base64 encoded)
        $fallbackCallback = rtrim(config('app.url'), '/') . '/api/payments/aba/webhook';
        $callbackUrlRaw = $params['callback_url'] ?? (Config::get('services.aba.callback_url') ?: $fallbackCallback);
        $callbackUrlBase64 = base64_encode($callbackUrlRaw);

        // ✅ Prepare data for purchase or QR mode
        if ($usePurchase) {
            // ------------------------
            // PURCHASE MODE
            // ------------------------
            $shipping = $params['shipping'] ?? '';
            $continueSuccessUrl = $params['continue_success_url'] ?? '';
            $continueFailUrl = $params['continue_fail_url'] ?? '';

            // ✅ Build hash (official ABA order)
            $b4hash = $reqTime
                . $merchantId
                . $tranId
                . $amountForHash
                . $items
                . $shipping
                . $firstName
                . $lastName
                . $email
                . $phone
                . $purchaseType
                . $paymentOption
                . $currency
                . $continueSuccessUrl
                . $continueFailUrl
                . $callbackUrlBase64;

            // Remove line breaks or spaces just in case
            $b4hash = preg_replace('/\s+/', '', $b4hash);

            $hash = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));

            $body = [
                'req_time' => $reqTime,
                'merchant_id' => $merchantId,
                'tran_id' => $tranId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'phone' => $phone,
                // Send same string as hashed
                'amount' => $amountForHash,
                'type' => $purchaseType, // ⚠️ NOT "purchase_type"
                'payment_option' => $paymentOption,
                'items' => $items,
                'shipping' => $shipping,
                'currency' => $currency,
                'continue_success_url' => $continueSuccessUrl,
                'continue_fail_url' => $continueFailUrl,
                'callback_url' => $callbackUrlBase64,
                'custom_fields' => $customFields,
                'return_params' => $returnParams,
                'hash' => $hash,
            ];
        } else {
            // ------------------------
            // GENERATE-QR MODE
            // ------------------------
            $b4hash = $reqTime
                . $merchantId
                . $tranId
                . $amountForHash
                . $items
                . $firstName
                . $lastName
                . $email
                . $phone
                . $purchaseType
                . $paymentOption
                . $callbackUrlBase64
                . ($params['return_deeplink'] ?? '')
                . $currency
                . $customFields
                . $returnParams
                . $payout
                . $lifetime
                . $qrImageTemplate;

            $b4hash = preg_replace('/\s+/', '', $b4hash);

            $hash = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));

            $body = [
                'req_time' => $reqTime,
                'merchant_id' => $merchantId,
                'tran_id' => $tranId,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'phone' => $phone,
                'amount' => $amount,
                'purchase_type' => $purchaseType,
                'payment_option' => $paymentOption,
                'items' => $items,
                'currency' => $currency,
                'callback_url' => $callbackUrlBase64,
                'return_deeplink' => $params['return_deeplink'] ?? null,
                'custom_fields' => $customFields,
                'return_params' => $returnParams,
                'payout' => $payout,
                'lifetime' => $lifetime,
                'qr_image_template' => $qrImageTemplate,
                'hash' => $hash,
            ];
        }

        // Remove null/empty values except required fields
        $body = array_filter($body, fn($v) => !is_null($v) && $v !== '');

        // ------------------------
        // HTTP Request
        // ------------------------
        $response = Http::asJson()->post($endpoint, $body);

        if (!$response->ok()) {
            Log::warning('ABA request non-200', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'response' => $response->body(),
                'body' => $body,
                'b4hash' => $b4hash ?? '',
                'hash' => $hash ?? '',
            ]);
        }

        $data = $response->json();

        return [
            'success' => isset($data['status']['code']) && (string) $data['status']['code'] === '0',
            'qrImage' => $data['qrImage'] ?? null,
            'abapay_deeplink' => $data['abapay_deeplink'] ?? ($data['deeplink'] ?? null),
            'amount' => $data['amount'] ?? $amount,
            'currency' => $data['currency'] ?? $currency,
            'raw' => $data,
        ];
    }
}
