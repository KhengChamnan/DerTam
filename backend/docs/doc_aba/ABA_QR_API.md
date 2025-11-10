# ABA QR API – Generate QR Code

## Endpoint
**POST** `/api/payment-gateway/v1/payments/generate-qr`

Supports both **online** and **instore merchants**.

### Supported Payment Options
| Currency | Supported Methods |
|-----------|-------------------|
| **KHR** | ABA PAY, KHQR |
| **USD** | ABA PAY, KHQR, WeChat, Alipay |

---

## 🧾 Request

### **Headers**
| Name | Type | Required | Example |
|------|------|-----------|----------|
| `Content-Type` | string | ✅ Required | `application/json` |

---

### **Body Parameters (application/json)**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| `req_time` | string | ✅ | Request datetime (UTC, `YYYYMMDDHHmmss`) |
| `merchant_id` | string | ✅ | Merchant key provided by ABA Bank (≤ 30 chars) |
| `tran_id` | string | ✅ | Unique transaction ID (≤ 20 chars) |
| `first_name` | string | Optional | Payer’s first name (≤ 20 chars) |
| `last_name` | string | Optional | Payer’s last name (≤ 20 chars) |
| `email` | string | Optional | Payer’s email (≤ 50 chars) |
| `phone` | string | Optional | Payer’s phone (≤ 20 chars) |
| `amount` | number | ✅ | Transaction amount (≥ 100 KHR or 0.01 USD) |
| `currency` | string | ✅ | `KHR` or `USD` |
| `purchase_type` | string | Optional | `pre-auth` or `purchase` (default `purchase`) |
| `payment_option` | string | ✅ | `abapay_khqr`, `wechat`, `alipay` |
| `items` | string | Optional | Base64 JSON array of items |
| `callback_url` | string | Optional | Base64 URL for callback |
| `return_deeplink` | string | Optional | Base64 JSON deep link for mobile return |
| `custom_fields` | string | Optional | Base64 JSON custom data |
| `return_params` | string | Optional | JSON with additional parameters |
| `payout` | string | Optional | Base64 JSON payout info |
| `lifetime` | integer | ✅ | Lifetime in minutes (min: 3, max: 43200 = 30 days) |
| `qr_image_template` | string | ✅ | Template for QR image (≤ 20 chars) |
| `hash` | string | ✅ | Base64 HMAC SHA512 hash of concatenated fields |

---

## 🔐 Hash Generation (PHP Example)

```php
// Public key provided by ABA Bank
$api_key = 'API KEY PROVIDED BY ABA BANK';

// Prepare data to hash
$b4hash = $req_time . $merchant_id . $tran_id . $amount . $items .
           $first_name . $last_name . $email . $phone . $purchase_type .
           $payment_option . $callback_url . $return_deeplink . $currency .
           $custom_fields . $return_params . $payout . $lifetime . $qr_image_template;

// Generate Base64 HMAC SHA-512 hash
$hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key, true));
```

---

## 🧰 Request Example (cURL)

```bash
curl -X POST "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "req_time": "20250312095439",
    "merchant_id": "keng.dara.online",
    "tran_id": "20250311033231",
    "first_name": "ABA",
    "last_name": "Bank",
    "email": "aba.bank@gmail.com",
    "phone": "012345678",
    "amount": 0.01,
    "purchase_type": "purchase",
    "payment_option": "abapay_khqr",
    "items": "W3sibmFtZSI6IicgVU5JT04gU0VMRUNUIG51bGwsIHZlcnNpb24oKSwgbnVsbCAtLSIsInF1YW50aXR5IjozLCJwcmljZSI6MTAwLjAxfV0=",
    "currency": "USD",
    "callback_url": "aHR0cHM6Ly9hcGkuY2FsbGJhY2suY29tL25vdGlmeQ==",
    "return_deeplink": null,
    "custom_fields": null,
    "return_params": null,
    "payout": null,
    "lifetime": 6,
    "qr_image_template": "template3_color",
    "hash": "ZyDmMe/kznbY2e...ZB6tMnqv57V06T13du8807dcbPTg=="
  }'
```

---

## ✅ Response Example

### **200 OK (Success)**

```json
{
  "qrString": "00020101021230510016abaakhppxxx@abaa01151250212145328460208ABA Bank52048249530384054040.015802KH5925OLD ME 25 CHAR WINNER IP",
  "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAOC0lEQVR4nO2deahV1RfHl6ZlaaZ",
  "abapay_deeplink": "abamobilebank://ababank.com?type=payway&qrcode=00020101021230510016abaakhppxxx%40abaa01151250212145328460208ABA+Bank5",
  "app_store": "https://itunes.apple.com/al/app/aba-mobile-bank/id968860649?mt=8",
  "play_store": "https://play.google.com/store/apps/details?id=com.paygo24.ibank",
  "amount": 0.01,
  "currency": "USD",
  "status": {
    "code": "0",
    "message": "Success.",
    "trace_id": "b9f93f45b49f08e26dfcfb8c2da396c6"
  }
}
```

---

## ⚠️ Possible Status Codes

| Code | Meaning |
|------|----------|
| 0 | Success |
| 1 | Wrong Hash |
| 6 | Requested domain not whitelisted |
| 8 | General error — contact support |
| 12 | Payment currency not allowed |
| 16 | Invalid first name |
| 17 | Invalid last name |
| 18 | Invalid phone number |
| 19 | Invalid email |
| 21 | End of API lifetime |
| 23 | Payment option not enabled |
| 32 | Service not enabled |
| 35 | Invalid payout info |
| 44 | Purchase amount exceeds limit |
| 47 | KHR amount below 100 KHR |
| 48 | Invalid parameters |
| 96 | Invalid merchant data |
| 102 | URL not whitelisted |
| 403 | Duplicate transaction ID |
| 429 | Rate limit exceeded — try again later |

---

## 📝 Notes
- Works for both **online** and **instore** merchant modes.  
- `hash` is required for authentication — any mismatch will result in error code `1`.
- `lifetime` defines how long the QR remains valid.
- Use `abapay_deeplink` to directly open ABA Mobile app.
- Use `app_store` and `play_store` URLs if ABA Mobile is not installed.
- Sandbox URL: `https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr`
- Production URL: `https://checkout.payway.com.kh/api/payment-gateway/v1/payments/generate-qr`
