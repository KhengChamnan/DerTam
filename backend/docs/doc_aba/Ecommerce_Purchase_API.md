# Ecommerce Checkout Purchase API (PayWay)

## Endpoint
**POST** `api/payment-gateway/v1/payments/purchase`

The **Purchase API** is used to initiate a payment transaction between a customer and a merchant through PayWay.  
It allows merchants to request a payment by providing transaction details such as amount, currency, and item list.

Once called, the customer is redirected to PayWay’s hosted checkout page, bottom sheet, or modal popup (depending on your integration type) to complete the payment.  
After completion, PayWay sends the result to your **return URL** or **callback**.

---

## 🧾 Request

### **Headers**
| Name | Type | Required | Example |
|------|------|-----------|----------|
| `Content-Type` | string | ✅ Required | `multipart/form-data` |

---

### **Body Parameters (multipart/form-data)**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| `req_time` | string | ✅ | Request date and time in UTC format (`YYYYMMDDHHmmss`) |
| `merchant_id` | string | ✅ | Merchant key provided by ABA Bank (≤ 30 chars) |
| `tran_id` | string | ✅ | Unique transaction identifier (≤ 20 chars) |
| `firstname` | string | Optional | Buyer’s first name (≤ 20 chars) |
| `lastname` | string | Optional | Buyer’s last name (≤ 20 chars) |
| `email` | string | Optional | Buyer’s email (≤ 50 chars) |
| `phone` | string | Optional | Buyer’s phone (≤ 20 chars) |
| `type` | string | Optional | Transaction type. Default: `purchase`. Options: `pre-auth`, `purchase`. |
| `payment_option` | string | Optional | Payment method: `cards`, `abapay_khqr`, `abapay_khqr_deeplink`, `alipay`, `wechat`, `google_pay` |
| `items` | string | Optional | Base64-encoded JSON of items purchased |
| `shipping` | number | Optional | Shipping fee |
| `amount` | number | ✅ | Total purchase amount |
| `currency` | string | Optional | `KHR` or `USD` (defaults to merchant profile currency) |
| `return_url` | string | Optional | URL for successful payment callback |
| `cancel_url` | string | Optional | URL for cancellation or closing payment |
| `skip_success_page` | integer | Optional | `0` = show success page, `1` = skip success page |
| `continue_success_url` | string | Optional | Redirect URL after successful payment |
| `return_deeplink` | string | Optional | Base64-encoded deep link to mobile app (iOS & Android) |
| `custom_fields` | string | Optional | Base64-encoded JSON with custom transaction data |
| `return_params` | string | Optional | Info to include in return URL |
| `view_type` | string | Optional | `hosted_view` or `popup` |
| `payment_gate` | integer | Optional | Set `0` to use Checkout service |
| `payout` | string | Optional | Base64 JSON payout info |
| `additional_params` | string | Optional | For WeChat Mini Program |
| `lifetime` | integer | Optional | Payment lifetime (3 mins – 30 days) |
| `google_pay_token` | string | Optional | Required if using `google_pay` |
| `hash` | string | ✅ | Base64 HMAC SHA512 hash signature |

---

## 🔐 Hash Generation (PHP Example)

```php
// Public API key from ABA Bank
$api_key = "API KEY PROVIDED BY ABA BANK";

// Concatenate fields
$b4hash = $req_time . $merchant_id . $tran_id . $amount . $items . $shipping .
           $firstname . $lastname . $email . $phone . $type . $payment_option .
           $return_url . $cancel_url . $continue_success_url . $return_deeplink .
           $currency . $custom_fields . $return_params . $payout . $lifetime .
           $additional_params . $google_pay_token . $skip_success_page;

// Generate Base64 HMAC SHA512 hash
$hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key, true));
```

---

## 🧰 Request Example (cURL)

```bash
curl -X POST https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase   -H "Content-Type: multipart/form-data"   -F "req_time=20250101010101"   -F "merchant_id=YOUR_MERCHANT_ID"   -F "tran_id=BK-12345"   -F "amount=10.00"   -F "currency=KHR"   -F "payment_option=abapay_khqr_deeplink"   -F "items=$(echo '[{"name":"product 1","quantity":1,"price":1.00}]' | base64)"   -F "return_url=https://yourdomain.com/payment/success"   -F "cancel_url=https://yourdomain.com/payment/cancel"   -F "hash=GENERATED_HASH"
```

---

## ✅ Response Examples

### **200 OK (HTML Checkout Page)**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>PayWay - Checkout</title>
  </head>
  <body>...</body>
</html>
```

### **200 OK (JSON QR Response)**
```json
{
  "qr_string": "base64_qr_data_here",
  "abapay_deeplink": "abapay://payment?param=value",
  "checkout_qr_url": "https://checkout-sandbox.payway.com.kh/checkout/qr?id=12345"
}
```

---

## 📝 Notes
- If using `abapay_khqr_deeplink`, PayWay returns a JSON with QR data and deep links.
- `hash` ensures request authenticity. Any missing or incorrect field in hash generation will cause request rejection.
- The `amount` must be greater than or equal to 0.01 USD or 100 KHR.
- Sandbox URL: `https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase`
- Production URL: `https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase`
