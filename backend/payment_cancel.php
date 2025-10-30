<?php
/**
 * ABA PayWay - Payment Cancel Callback
 * This page is called when user cancels the payment or closes the checkout
 */

// Get parameters from ABA
$params = $_GET;

// Log the cancellation
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'action' => 'payment_cancelled',
    'received_params' => $params,
    'raw_query' => $_SERVER['QUERY_STRING'] ?? ''
];

file_put_contents('aba_payment_logs.txt', json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Cancelled - ABA PayWay</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
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
            text-align: center;
        }
        
        .cancel-icon {
            width: 80px;
            height: 80px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: shake 0.5s ease-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .cross {
            font-size: 48px;
            color: white;
        }
        
        h1 {
            color: #ef4444;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .message-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .message-box p {
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .message-box p:last-child {
            margin-bottom: 0;
        }
        
        .details-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #666;
            font-weight: 500;
        }
        
        .detail-value {
            color: #333;
            font-weight: 600;
        }
        
        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .btn-secondary {
            background: #6b7280;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .debug-section {
            margin-top: 30px;
            padding: 20px;
            background: #f1f3f5;
            border-radius: 8px;
            text-align: left;
        }
        
        .debug-section h3 {
            margin-bottom: 10px;
            color: #333;
            font-size: 14px;
        }
        
        .debug-content {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #555;
            white-space: pre-wrap;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="cancel-icon">
            <div class="cross">✕</div>
        </div>
        
        <h1>Payment Cancelled</h1>
        <p class="subtitle">Your payment has been cancelled</p>
        
        <div class="message-box">
            <p><strong>ℹ️ What happened?</strong></p>
            <p>You cancelled the payment or closed the checkout window. Don't worry, no charges were made to your account.</p>
        </div>
        
        <?php if (!empty($params)): ?>
        <div class="details-box">
            <h3 style="margin-bottom: 15px; color: #333;">Transaction Details</h3>
            
            <?php if (isset($params['tran_id'])): ?>
            <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['tran_id']); ?></span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['amount'])): ?>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">
                    <?php 
                    echo number_format($params['amount'], 2);
                    if (isset($params['currency'])) {
                        echo ' ' . htmlspecialchars($params['currency']);
                    }
                    ?>
                </span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['req_time'])): ?>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['req_time']); ?></span>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        
        <div class="btn-group">
            <a href="test_aba_purchase_checkout.php" class="btn btn-primary">Try Again</a>
            <a href="/" class="btn btn-secondary">Go Home</a>
        </div>
        
        <div class="debug-section">
            <h3>🔍 Debug Information</h3>
            <details>
                <summary style="cursor: pointer; color: #667eea; font-weight: bold; margin-bottom: 10px;">
                    View Raw Data
                </summary>
                <div class="debug-content"><?php echo htmlspecialchars(json_encode($params, JSON_PRETTY_PRINT)); ?></div>
            </details>
        </div>
    </div>
</body>
</html>
