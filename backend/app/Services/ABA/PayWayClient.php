<?php

namespace App\Services\ABA;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayWayClient
{
    /**
     * Create a payment transaction with ABA PayWay Purchase API.
     * This registers the transaction in ABA's portal and returns a valid deeplink.
     * 
     * @param array $params Payment parameters
     * @return array Response with success status, QR code, deeplink, etc.
     */
    public function purchase(array $params): array
    {
        $merchantId = Config::get('services.aba.merchant_id');
        $apiKey = Config::get('services.aba.api_key');
        $purchaseEndpoint = Config::get('services.aba.purchase_endpoint');
        $defaultCurrency = Config::get('services.aba.default_currency', 'KHR');
        $defaultLifetime = (int) Config::get('services.aba.default_lifetime', 10);

        // Required parameters
        $reqTime = $params['req_time'] ?? gmdate('YmdHis');
        $tranId = $params['tran_id'];
        $amount = (float) $params['amount'];
        $currency = strtoupper($params['currency'] ?? $defaultCurrency);

        // Format amount based on currency (KHR = no decimals, USD = 2 decimals)
        $amountFormatted = $currency === 'KHR'
            ? number_format($amount, 0, '.', '')
            : number_format($amount, 2, '.', '');

        // Optional parameters with defaults
        $purchaseType = $params['purchase_type'] ?? 'purchase';
        $paymentOption = $params['payment_option'] ?? 'abapay_khqr_deeplink';
        $firstName = $params['first_name'] ?? '';
        $lastName = $params['last_name'] ?? '';

        // Auto-split name if full name provided in first_name
        if ($firstName && !$lastName && str_contains($firstName, ' ')) {
            [$firstName, $lastName] = array_pad(explode(' ', trim($firstName), 2), 2, '');
        }

        $email = $params['email'] ?? '';
        $phone = $params['phone'] ?? '';
        $items = $params['items'] ?? '';
        
        // Shipping must be a number (0 if not provided)
        $shipping = isset($params['shipping']) ? (float) $params['shipping'] : 0;
        $shippingFormatted = $currency === 'KHR'
            ? number_format($shipping, 0, '.', '')
            : number_format($shipping, 2, '.', '');

        // URLs for payment flow
        $returnUrl = $params['return_url'] ?? '';
        $cancelUrl = $params['cancel_url'] ?? '';
        $continueSuccessUrl = $params['continue_success_url'] ?? '';
        $returnDeeplink = $params['return_deeplink'] ?? '';
        
        // Additional optional fields
        $customFields = $params['custom_fields'] ?? '';
        $returnParams = $params['return_params'] ?? '';
        $payout = $params['payout'] ?? '';
        $lifetime = isset($params['lifetime']) ? (int) $params['lifetime'] : $defaultLifetime;
        $additionalParams = $params['additional_params'] ?? '';
        $googlePayToken = $params['google_pay_token'] ?? '';
        $skipSuccessPage = $params['skip_success_page'] ?? '';

        // Build hash in exact order per ABA documentation
        $hashString = $reqTime
            . $merchantId
            . $tranId
            . $amountFormatted
            . $items
            . $shippingFormatted
            . $firstName
            . $lastName
            . $email
            . $phone
            . $purchaseType
            . $paymentOption
            . $returnUrl
            . $cancelUrl
            . $continueSuccessUrl
            . $returnDeeplink
            . $currency
            . $customFields
            . $returnParams
            . $payout
            . $lifetime
            . $additionalParams
            . $googlePayToken
            . $skipSuccessPage;

        // Remove whitespace as per ABA requirements
        $hashString = preg_replace('/\s+/', '', $hashString);
        $hash = base64_encode(hash_hmac('sha512', $hashString, $apiKey, true));

        // Prepare request body
        $body = [
            'req_time' => $reqTime,
            'merchant_id' => $merchantId,
            'tran_id' => $tranId,
            'amount' => $amountFormatted,
            'items' => $items,
            'shipping' => $shippingFormatted,
            'firstname' => $firstName,
            'lastname' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'type' => $purchaseType,
            'payment_option' => $paymentOption,
            'return_url' => $returnUrl,
            'cancel_url' => $cancelUrl,
            'continue_success_url' => $continueSuccessUrl,
            'return_deeplink' => $returnDeeplink,
            'currency' => $currency,
            'custom_fields' => $customFields,
            'return_params' => $returnParams,
            'payout' => $payout,
            'lifetime' => $lifetime,
            'additional_params' => $additionalParams,
            'google_pay_token' => $googlePayToken,
            'skip_success_page' => $skipSuccessPage,
            'hash' => $hash,
        ];

        // Keep all fields used in hash (ABA requires even empty fields)
        $body = array_filter($body, fn($v) => !is_null($v));

        Log::info('ABA Purchase Request', [
            'tran_id' => $tranId,
            'amount' => $amountFormatted,
            'currency' => $currency,
            'payment_option' => $paymentOption,
        ]);

        // Make request to ABA Purchase API
        $response = Http::asForm()
            ->timeout(30)
            ->withOptions([
                'curl' => [
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                ],
            ])
            ->post($purchaseEndpoint, $body);

        if (!$response->ok()) {
            Log::error('ABA Purchase Request Failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'tran_id' => $tranId,
            ]);
        }

        // Parse response
        $contentType = $response->header('Content-Type');
        $isJson = str_contains($contentType, 'application/json');

        if ($isJson) {
            $data = $response->json();
        } else {
            // HTML response (e.g., for abapay_khqr payment option)
            $data = [
                'status' => ['code' => '0', 'message' => 'Success - HTML checkout page returned'],
                'html' => $response->body(),
            ];
        }

        // Check for errors
        if (isset($data['status']['code']) && !in_array((string) $data['status']['code'], ['0', '00'], true)) {
            Log::error('ABA Purchase Gateway Error', [
                'status_code' => $data['status']['code'],
                'status_message' => $data['status']['message'] ?? 'Unknown error',
                'tran_id' => $tranId,
            ]);
        }

        // Log success
        if ($response->ok() && $isJson) {
            Log::info('ABA Purchase Successful', [
                'tran_id' => $tranId,
                'has_qr' => isset($data['qr_string']),
                'has_deeplink' => isset($data['abapay_deeplink']),
            ]);
        }

        // Determine success
        $qrImage = $data['qr_string'] ?? null;
        $hasStatusSuccess = isset($data['status']['code']) && in_array((string) $data['status']['code'], ['0', '00'], true);
        $hasValidResponse = !empty($qrImage) || !empty($data['abapay_deeplink']);
        $isSuccess = $hasStatusSuccess || ($isJson && $hasValidResponse && $response->ok());

        return [
            'success' => $isSuccess,
            'qrImage' => $qrImage,
            'abapay_deeplink' => $data['abapay_deeplink'] ?? null,
            'checkout_qr_url' => $data['checkout_qr_url'] ?? null,
            'amount' => $data['amount'] ?? $amount,
            'currency' => $data['currency'] ?? $currency,
            'raw' => $data,
        ];
    }

    /**
     * Backward compatibility alias for purchase()
     * @deprecated Use purchase() instead
     */
    public function generateQr(array $params): array
    {
        return $this->purchase($params);
    }

    /**
     * Get transaction details from ABA PayWay
     * 
     * @param string $tranId The transaction ID to query
     * @return array
     */
    public function getTransactionDetail(string $tranId): array
    {
        $merchantId = Config::get('services.aba.merchant_id');
        $apiKey = Config::get('services.aba.api_key');
        $transactionDetailEndpoint = Config::get(
            'services.aba.transaction_detail_endpoint',
            'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/transaction-detail'
        );

        $reqTime = gmdate('YmdHis');

        // Build hash: req_time + merchant_id + tran_id
        $b4hash = $reqTime . $merchantId . $tranId;
        $hash = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));

        $body = [
            'req_time' => $reqTime,
            'merchant_id' => $merchantId,
            'tran_id' => $tranId,
            'hash' => $hash,
        ];

        Log::debug('ABA Transaction Detail Request', [
            'tran_id' => $tranId,
            'b4hash' => $b4hash,
            'hash' => $hash,
        ]);

        // Make POST request
        $response = Http::asJson()->post($transactionDetailEndpoint, $body);

        $data = $response->json();

        if (!$response->ok()) {
            Log::warning('ABA transaction detail request failed', [
                'endpoint' => $transactionDetailEndpoint,
                'status' => $response->status(),
                'response' => $response->body(),
                'tran_id' => $tranId,
            ]);
        }

        // Check for errors - status might be nested in ['status']['code'] or direct
        if (isset($data['status']) && is_array($data['status'])) {
            $statusCode = (string) ($data['status']['code'] ?? '');
            $errorMessage = $data['status']['message'] ?? 'Unknown error';
        } else {
            $statusCode = (string) ($data['status'] ?? ($data['code'] ?? ''));
            $errorMessage = $data['message'] ?? 'Unknown error';
        }
        
        $isSuccess = in_array($statusCode, ['0', '00'], true);

        if (!$isSuccess) {
            Log::warning('ABA transaction detail error', [
                'tran_id' => $tranId,
                'status_code' => $statusCode,
                'message' => $errorMessage,
                'response' => $data,
            ]);
        }

        return [
            'success' => $isSuccess,
            'data' => $data,
            'error' => $isSuccess ? null : $errorMessage,
        ];
    }
}
