<?php
/**
 * ABA PayWay Purchase API - Simple Test Script
 * This creates a checkout modal for testing the payment gateway
 */

// ========================================
// CONFIGURATION - UPDATE THESE VALUES
// ========================================
$MERCHANT_ID = "ec462379";  // Get from ABA Bank
$API_KEY = "5f72dc74770839713b83610e9c49764f076de9c0";          // Get from ABA Bank
$USE_SANDBOX = true;                      // true = sandbox, false = production

// API URLs
$PURCHASE_URL = $USE_SANDBOX 
    ? "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase"
    : "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase";

// ========================================
// PAYMENT DETAILS
// ========================================
$req_time = gmdate('YmdHis');  // Current time in UTC (YYYYMMDDHHmmss)
$tran_id = "TEST-" . time();    // Unique transaction ID
$amount = 10.00;                 // Amount to charge
$currency = "USD";               // USD or KHR

// Customer information (optional)
$firstname = "John";
$lastname = "Doe";
$email = "john.doe@example.com";
$phone = "012345678";

// Items being purchased (optional but recommended)
$items = [
    [
        "name" => "Test Product 1",
        "quantity" => 1,
        "price" => 5.00
    ],
    [
        "name" => "Test Product 2",
        "quantity" => 1,
        "price" => 5.00
    ]
];
$items_base64 = base64_encode(json_encode($items));

$shipping = 0.00;
$type = "purchase";  // purchase or pre-auth
// ⚠️ CRITICAL: Set to null (not empty string) to completely omit from hash and request
// This will give you the checkout modal. Any value here returns JSON QR code.
$payment_option = null;  // null = checkout modal, "abapay_khqr_deeplink" = JSON QR

// Return URLs - Update these to your domain
$return_url = "http://localhost:8000/payment_success.php";
$cancel_url = "http://localhost:8000/payment_cancel.php";
$continue_success_url = "http://localhost:8000/payment_complete.php";

// View configuration - Don't set view_type to get the default checkout page
$skip_success_page = 0;  // 0 = show success page, 1 = skip

// ========================================
// HASH GENERATION (EXACT ORDER PER ABA DOCS)
// ========================================
$return_deeplink = '';
$custom_fields = '';
$return_params = '';
$payout = '';
$lifetime = '';
$additional_params = '';
$google_pay_token = '';

// Build hash string - ONLY include payment_option if it has a value
$b4hash = $req_time
    . $MERCHANT_ID
    . $tran_id
    . $amount
    . $items_base64
    . $shipping
    . $firstname
    . $lastname
    . $email
    . $phone
    . $type
    . ($payment_option ?? '')  // Use empty string if null
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

$hash = base64_encode(hash_hmac('sha512', $b4hash, $API_KEY, true));

// ========================================
// PREPARE FORM DATA
// ========================================
// CRITICAL: payment_option must be completely excluded for checkout modal
$postData = [
    'req_time' => $req_time,
    'merchant_id' => $MERCHANT_ID,
    'tran_id' => $tran_id,
    'amount' => $amount,
    'items' => $items_base64,
    'shipping' => $shipping,
    'firstname' => $firstname,
    'lastname' => $lastname,
    'email' => $email,
    'phone' => $phone,
    'type' => $type,
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
    'hash' => $hash
];

// Only add payment_option if it has a value
if ($payment_option !== null && $payment_option !== '') {
    $postData['payment_option'] = $payment_option;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ABA PayWay - Test Checkout</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .info-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
        }
        
        .info-label {
            color: #666;
            font-weight: 500;
        }
        
        .info-value {
            color: #333;
            font-weight: 600;
        }
        
        .items-list {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        
        .item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .item:last-child {
            border-bottom: none;
        }
        
        .total-amount {
            font-size: 32px;
            color: #667eea;
            font-weight: bold;
            text-align: center;
            margin: 25px 0;
        }
        
        .btn-checkout {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-checkout:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .btn-checkout:active {
            transform: translateY(0);
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 13px;
        }
        
        .warning strong {
            display: block;
            margin-bottom: 5px;
        }
        
        .debug-info {
            margin-top: 30px;
            padding: 20px;
            background: #f1f3f5;
            border-radius: 8px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }
        
        .debug-info h3 {
            margin-bottom: 10px;
            color: #333;
            font-size: 14px;
        }
        
        .debug-row {
            margin-bottom: 8px;
            word-break: break-all;
        }
        
        .debug-label {
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 ABA PayWay Checkout Test</h1>
            <p>Test the payment gateway integration</p>
        </div>
        
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value"><?php echo $tran_id; ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value"><?php echo $firstname . ' ' . $lastname; ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value"><?php echo $email; ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value"><?php echo ($payment_option === null || $payment_option === '') ? 'Default Checkout Modal' : strtoupper($payment_option); ?></span>
            </div>
            
            <div class="items-list">
                <strong>Items:</strong>
                <?php foreach($items as $item): ?>
                <div class="item">
                    <span><?php echo $item['name']; ?> × <?php echo $item['quantity']; ?></span>
                    <span>$<?php echo number_format($item['price'], 2); ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div class="total-amount">
            $<?php echo number_format($amount, 2); ?> <?php echo $currency; ?>
        </div>
        
        <form id="checkoutForm" action="<?php echo $PURCHASE_URL; ?>" method="POST">
            <?php foreach($postData as $key => $value): ?>
                <input type="hidden" name="<?php echo $key; ?>" value="<?php echo htmlspecialchars($value); ?>">
            <?php endforeach; ?>
            
            <button type="submit" class="btn-checkout">
                🔒 Proceed to Checkout
            </button>
        </form>
        
        <div class="warning">
            <strong>⚠️ Important Configuration:</strong>
            Before testing, update the <code>$MERCHANT_ID</code> and <code>$API_KEY</code> 
            at the top of this PHP file with your actual credentials from ABA Bank.
            Currently using: <?php echo $USE_SANDBOX ? 'SANDBOX' : 'PRODUCTION'; ?> mode.
        </div>
        
        <div class="debug-info">
            <h3>🔍 Debug Information</h3>
            <div class="debug-row">
                <span class="debug-label">Environment:</span> <?php echo $USE_SANDBOX ? 'Sandbox' : 'Production'; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">API Endpoint:</span> <?php echo $PURCHASE_URL; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Request Time:</span> <?php echo $req_time; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Merchant ID:</span> <?php echo $MERCHANT_ID; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Transaction ID:</span> <?php echo $tran_id; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Fields Being Sent:</span> <?php echo implode(', ', array_keys($postData)); ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Payment Option Included?</span> <?php echo isset($postData['payment_option']) ? 'YES ❌ (This causes JSON response!)' : 'NO ✅ (Correct for modal)'; ?>
            </div>
            <div class="debug-row">
                <span class="debug-label">Hash Input Length:</span> <?php echo strlen($b4hash); ?> chars
            </div>
            <div class="debug-row">
                <span class="debug-label">Hash (first 50 chars):</span> <?php echo substr($hash, 0, 50) . '...'; ?>
            </div>
            <div class="debug-row" style="margin-top: 10px;">
                <details>
                    <summary style="cursor: pointer; color: #667eea; font-weight: bold;">View Hash Components</summary>
                    <div style="margin-top: 10px; font-size: 11px;">
                        <div>req_time: '<?php echo $req_time; ?>'</div>
                        <div>merchant_id: '<?php echo $MERCHANT_ID; ?>'</div>
                        <div>tran_id: '<?php echo $tran_id; ?>'</div>
                        <div>amount: '<?php echo $amount; ?>'</div>
                        <div>items: '<?php echo substr($items_base64, 0, 30) . '...'; ?>'</div>
                        <div>shipping: '<?php echo $shipping; ?>'</div>
                        <div>firstname: '<?php echo $firstname; ?>'</div>
                        <div>lastname: '<?php echo $lastname; ?>'</div>
                        <div>email: '<?php echo $email; ?>'</div>
                        <div>phone: '<?php echo $phone; ?>'</div>
                        <div>type: '<?php echo $type; ?>'</div>
                        <div>payment_option: '<?php echo $payment_option; ?>'</div>
                        <div>return_url: '<?php echo $return_url; ?>'</div>
                        <div>cancel_url: '<?php echo $cancel_url; ?>'</div>
                        <div>continue_success_url: '<?php echo $continue_success_url; ?>'</div>
                        <div>return_deeplink: '<?php echo $return_deeplink; ?>'</div>
                        <div>currency: '<?php echo $currency; ?>'</div>
                        <div>skip_success_page: '<?php echo $skip_success_page; ?>'</div>
                    </div>
                </details>
            </div>
        </div>
    </div>

    <script>
        // Optional: Handle form submission for popup view
        document.getElementById('checkoutForm').addEventListener('submit', function(e) {
            console.log('Opening PayWay checkout...');
            console.log('Transaction ID: <?php echo $tran_id; ?>');
        });
    </script>
</body>
</html>
