<?php
/**
 * ABA PayWay - Payment Success Callback
 * This page is called by ABA after a successful payment
 * 
 * ABA typically sends these GET parameters:
 * - tran_id: Transaction ID
 * - status: Payment status (0=success, 1=pending, 2=failed)
 * - amount: Payment amount
 * - currency: Currency (USD/KHR)
 * - hash: Verification hash
 */

// API Key for hash verification
$API_KEY = "5f72dc74770839713b83610e9c49764f076de9c0";

// Get parameters from ABA
$params = $_GET;

// Log the raw response for debugging
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'received_params' => $params,
    'raw_query' => $_SERVER['QUERY_STRING'] ?? ''
];

// Save to log file
file_put_contents('aba_payment_logs.txt', json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success - ABA PayWay</title>
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
            text-align: center;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: scaleIn 0.5s ease-out;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
        
        .checkmark {
            font-size: 48px;
            color: white;
        }
        
        h1 {
            color: #10b981;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
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
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
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
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">
            <div class="checkmark">✓</div>
        </div>
        
        <h1>Payment Successful!</h1>
        <p class="subtitle">Your transaction has been processed successfully</p>
        
        <?php if (!empty($params)): ?>
        <div class="details-box">
            <h3 style="margin-bottom: 15px; color: #333;">Transaction Details</h3>
            
            <?php if (isset($params['tran_id'])): ?>
            <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value"><?php echo htmlspecialchars($params['tran_id']); ?></span>
            </div>
            <?php endif; ?>
            
            <?php if (isset($params['status'])): ?>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <?php
                    $status = $params['status'];
                    if ($status == '0' || $status === 'success') {
                        echo '<span class="status-badge status-success">Success</span>';
                    } elseif ($status == '1' || $status === 'pending') {
                        echo '<span class="status-badge status-pending">Pending</span>';
                    } else {
                        echo '<span class="status-badge">' . htmlspecialchars($status) . '</span>';
                    }
                    ?>
                </span>
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
        </div>
        <?php else: ?>
        <div class="details-box">
            <p style="color: #f59e0b; text-align: center;">
                ⚠️ No payment data received from ABA PayWay
            </p>
        </div>
        <?php endif; ?>
        
        <a href="test_aba_purchase_checkout.php" class="btn">← Back to Payment Page</a>
        
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
