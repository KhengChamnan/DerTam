<?php
/**
 * ABA PayWay - Payment Complete Callback
 * This page is shown after the success page (if skip_success_page = 0)
 * This is the final page after ABA's success confirmation
 */

// Get parameters from ABA
$params = $_GET;

// Log the completion
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'action' => 'payment_complete',
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
    <title>Payment Complete - ABA PayWay</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            max-width: 700px;
            width: 100%;
            padding: 50px;
            text-align: center;
        }
        
        .complete-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            animation: bounceIn 0.6s ease-out;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }
        
        @keyframes bounceIn {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .checkmark {
            font-size: 60px;
            color: white;
        }
        
        h1 {
            color: #10b981;
            margin-bottom: 15px;
            font-size: 32px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 20px;
            font-size: 18px;
        }
        
        .confirmation-message {
            background: #d1fae5;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            color: #065f46;
        }
        
        .confirmation-message p {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .confirmation-message p:last-child {
            margin-bottom: 0;
        }
        
        .details-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            text-align: left;
        }
        
        .details-box h3 {
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
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
        
        .amount-highlight {
            font-size: 36px;
            color: #10b981;
            font-weight: bold;
            margin: 30px 0;
        }
        
        .next-steps {
            background: #fef3c7;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
        }
        
        .next-steps h3 {
            color: #92400e;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            color: #78350f;
            margin-bottom: 10px;
            padding-left: 25px;
            position: relative;
        }
        
        .next-steps li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #f59e0b;
            font-weight: bold;
        }
        
        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 40px;
        }
        
        .btn {
            display: inline-block;
            padding: 14px 35px;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s;
            font-size: 16px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
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
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="complete-icon">
            <div class="checkmark">✓</div>
        </div>
        
        <h1>🎉 Payment Complete!</h1>
        <p class="subtitle">Thank you for your payment</p>
        
        <div class="confirmation-message">
            <p><strong>✅ Your payment has been successfully processed!</strong></p>
            <p>A confirmation email has been sent to your registered email address.</p>
            <p>Your transaction is now complete and secured.</p>
        </div>
        
        <?php if (isset($params['amount'])): ?>
        <div class="amount-highlight">
            <?php 
            echo number_format($params['amount'], 2);
            if (isset($params['currency'])) {
                echo ' ' . htmlspecialchars($params['currency']);
            }
            ?>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($params)): ?>
        <div class="details-box">
            <h3>📋 Transaction Summary</h3>
            
            <?php if (isset($params['tran_id'])): ?>
            <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['tran_id']); ?></span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['status'])): ?>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981;">
                    <?php 
                    $status = $params['status'];
                    echo $status == '0' || $status === 'success' ? 'COMPLETED' : strtoupper(htmlspecialchars($status)); 
                    ?>
                </span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['payment_option'])): ?>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['payment_option']); ?></span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['req_time'])): ?>
            <div class="detail-row">
                <span class="detail-label">Payment Time:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['req_time']); ?></span>
            </div>
            <?php endif; ?>
            
            <div class="detail-row">
                <span class="detail-label">Processed By:</span>
                <span class="detail-value">ABA PayWay</span>
            </div>
        </div>
        <?php endif; ?>
        
        <div class="next-steps">
            <h3>📌 What's Next?</h3>
            <ul>
                <li>Check your email for payment confirmation</li>
                <li>Save your transaction ID for future reference</li>
                <li>Your order will be processed shortly</li>
                <li>Contact support if you have any questions</li>
            </ul>
        </div>
        
        <div class="btn-group">
            <a href="/" class="btn btn-primary">Go to Dashboard</a>
            <a href="test_aba_purchase_checkout.php" class="btn btn-secondary">New Payment</a>
        </div>
        
        <div class="debug-section">
            <h3>🔍 Debug Information</h3>
            <details>
                <summary style="cursor: pointer; color: #667eea; font-weight: bold; margin-bottom: 10px;">
                    View Complete Transaction Data
                </summary>
                <div class="debug-content"><?php echo htmlspecialchars(json_encode($params, JSON_PRETTY_PRINT)); ?></div>
            </details>
        </div>
    </div>
</body>
</html>
