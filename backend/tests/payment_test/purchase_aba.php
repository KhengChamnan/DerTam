<?php

// === CHANGE THESE VALUES ===
$merchant_id = "ec462379";
$api_key     = "5f72dc74770839713b83610e9c49764f076de9c0";  // PUBLIC KEY PROVIDED BY ABA
$return_url  = "https://elegant-many-oyster.ngrok-free.app/return.php"; // OR NGROK URL
$cancel_url  = "https://elegant-many-oyster.ngrok-free.app/return.php"; // same for now
$amount      = "1.00"; // test amount
$tran_id     = strtoupper(uniqid('TXN')); // unique transaction id (<=20 chars)

// Generate required fields
$req_time = gmdate("YmdHis"); // Format: YYYYMMDDHHMMSS in GMT

// Payment parameters following hash_example.php structure
$items = "";
$shipping = "0.00";
$firstname = "";
$lastname = "";
$email = "";
$phone = "";
$type = "purchase";
$payment_option = "abapay_khqr_deeplink"; // Return QR JSON response
$continue_success_url = "";
$return_deeplink = "";
$currency = "USD";
$custom_fields = "";
$return_params = "";
$payout = "";
$lifetime = "";
$additional_params = "";
$google_pay_token = "";
$skip_success_page = "";

// Build hash string (EXACT ORDER as per ABA documentation)
$b4hash = $req_time
    . $merchant_id
    . $tran_id
    . $amount
    . $items
    . $shipping
    . $firstname
    . $lastname
    . $email
    . $phone
    . $type
    . $payment_option
    . $return_url
    . $cancel_url
    . $continue_success_url
    . $return_deeplink
    . $currency
    . $custom_fields
    . $return_params
    . $payout
    . $lifetime
    . $additional_params
    . $google_pay_token
    . $skip_success_page;

// Generate HMAC SHA-512 hash
$hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key, true));

// Prepare POST data - MUST include ALL fields used in hash
$data = [
    'req_time' => $req_time,
    'merchant_id' => $merchant_id,
    'tran_id' => $tran_id,
    'amount' => $amount,
    'items' => $items,
    'shipping' => $shipping,
    'firstname' => $firstname,
    'lastname' => $lastname,
    'email' => $email,
    'phone' => $phone,
    'type' => $type,
    'payment_option' => $payment_option,
    'return_url' => $return_url,
    'cancel_url' => $cancel_url,
    'continue_success_url' => $continue_success_url,
    'return_deeplink' => $return_deeplink,
    'currency' => $currency,
    'custom_fields' => $custom_fields,
    'return_params' => $return_params,
    'payout' => $payout,
    'lifetime' => $lifetime,
    'additional_params' => $additional_params,
    'google_pay_token' => $google_pay_token,
    'skip_success_page' => $skip_success_page,
    'hash' => $hash,
];

// Send request to PayWay
$url = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase"; // UAT endpoint

$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => [
        'Content-Type: multipart/form-data',
    ],
]);

$response = curl_exec($curl);
$error = curl_error($curl);
curl_close($curl);

$result = json_decode($response, true);
?>
<!DOCTYPE html>
<html>
<head>
    <title>ABA PayWay Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>ABA PayWay Purchase Test</h1>
    <hr>
    
    <?php if ($error): ?>
        <p class="error">❌ cURL Error: <?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    
    <?php if (isset($result["qrString"]) && !empty($result["qrString"])): ?>
        <p class="success">✅ Success! QR Code Generated:</p>
        <p><a href="<?= htmlspecialchars($result["qrString"] ?? '') ?>" target="_blank" style="font-size: 16px; color: #0066cc;">Click here to view QR Code</a></p>
        <p><img src="<?= htmlspecialchars($result["qrString"] ?? '') ?>" alt="QR Code" style="max-width: 300px; border: 1px solid #ccc; padding: 10px;"></p>
    <?php elseif (isset($result["abapay_deeplink"]) && !empty($result["abapay_deeplink"])): ?>
        <p class="success">✅ Success! ABA PayWay Deeplink Generated:</p>
        <p><a href="<?= htmlspecialchars($result["abapay_deeplink"] ?? '') ?>" target="_blank" style="font-size: 18px; font-weight: bold; color: #0066cc; text-decoration: none; padding: 10px 20px; background: #f0f0f0; border-radius: 5px; display: inline-block;">🔗 Click here to open ABA PayWay</a></p>
        <p style="margin-top: 20px;">Or scan the QR code from the app stores:</p>
        <?php if (isset($result["app_store"])): ?>
            <p>📱 <a href="<?= htmlspecialchars($result["app_store"] ?? '') ?>" target="_blank">Download from App Store</a></p>
        <?php endif; ?>
        <?php if (isset($result["play_store"])): ?>
            <p>📱 <a href="<?= htmlspecialchars($result["play_store"] ?? '') ?>" target="_blank">Download from Google Play</a></p>
        <?php endif; ?>
    <?php elseif (isset($result["checkout_qr_url"])): ?>
        <p class="success">✅ Success! QR Checkout URL:</p>
        <p><a href="<?= htmlspecialchars($result["checkout_qr_url"] ?? '') ?>" target="_blank"><?= htmlspecialchars($result["checkout_qr_url"] ?? '') ?></a></p>
    <?php elseif (isset($result["status"]["code"]) && $result["status"]["code"] == "00"): ?>
        <p class="success">✅ Success! Transaction Created:</p>
        <p>Transaction ID: <strong><?= htmlspecialchars($result["tran_id"] ?? 'N/A') ?></strong></p>
    <?php else: ?>
        <p class="error">❌ Unexpected Response - Check Full API Response below</p>
    <?php endif; ?>
    
    <h3>Full API Response:</h3>
    <pre><?php print_r($result); ?></pre>
    
    <h3>Transaction Details:</h3>
    <pre>Transaction ID: <?= htmlspecialchars($tran_id) ?>
Amount: <?= htmlspecialchars($amount) ?> <?= htmlspecialchars($currency) ?>
Request Time: <?= htmlspecialchars($req_time) ?></pre>
</body>
</html>