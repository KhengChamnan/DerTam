<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            overflow: hidden;
            margin-top: 40px;
            margin-bottom: 40px;
        }
        
        .header {
            background: linear-gradient(135deg, #01015b 0%, #1F3EEE 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        
        .pin-container {
            background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
            border: 2px dashed #1F3EEE;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .pin-label {
            font-size: 14px;
            font-weight: 600;
            color: #01015b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .pin-code {
            font-size: 36px;
            font-weight: 800;
            color: #01015b;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            border: 2px solid #1F3EEE;
            box-shadow: 0 4px 12px rgba(31, 62, 238, 0.15);
        }
        
        .warning-box {
            background-color: #fed7d7;
            border-left: 4px solid #fc8181;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        .warning-box .warning-icon {
            color: #e53e3e;
            font-size: 20px;
            margin-right: 10px;
        }
        
        .warning-box p {
            color: #742a2a;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
        }
        
        .info-section {
            background-color: #f0f5ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #1F3EEE;
        }
        
        .info-section h3 {
            color: #01015b;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .info-section ul {
            color: #01015b;
            font-size: 14px;
            margin-left: 20px;
        }
        
        .info-section li {
            margin-bottom: 5px;
        }
        
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer .signature {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 15px;
        }
        
        .footer .company {
            font-weight: 700;
            color: #2d3748;
        }
        
        .footer .support {
            font-size: 12px;
            color: #718096;
            margin-top: 20px;
        }
        
        .footer .support a {
            color: #1F3EEE;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 20px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .pin-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 12px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Secure access to your account</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello!</div>
            
            <div class="message">
                We received a request to reset your password. Use the verification code below to complete the process. This code is valid for a limited time only.
            </div>
            
            <div class="pin-container">
                <div class="pin-label">Your Verification Code</div>
                <div class="pin-code">{{ $pin }}</div>
            </div>
            
            <div class="warning-box">
                <p><span class="warning-icon">⚠️</span> <strong>Security Notice:</strong> Never share this code with anyone. If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            </div>
            
            <div class="info-section">
                <h3>🛡️ Security Tips</h3>
                <ul>
                    <li>This code will expire in 15 minutes</li>
                    <li>Use a strong, unique password for your account</li>
                    <li>Enable two-factor authentication for extra security</li>
                    <li>Always log out from shared devices</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                Best regards,<br>
                <span class="company">{{ config('app.name') }} Security Team</span>
            </div>
            
            <div class="support">
                Need help? <a href="mailto:support@{{ strtolower(config('app.name')) }}.com">Contact our support team</a>
            </div>
        </div>
    </div>
</body>
</html>