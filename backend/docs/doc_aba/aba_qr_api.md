# ABA QR API

## QR API

### API Endpoint
```
POST /api/payment-gateway/v1/payments/generate-qr
```

### Description
Support both online/instore merchant

### Supported Payment Options
- **Transaction currency KHR**: ABA PAY, KHQR
- **Transaction currency USD**: ABA PAY, KHQR, WeChat and Alipay

---

## Request

### Header Params

#### Content-Type
- **Type**: `string`
- **Required**: Yes
- **Example**: `application/json`

---

### Body Params (application/json)

#### req_time
- **Type**: `string`
- **Required**: Yes
- **Description**: Request date and time in UTC format as `YYYYMMDDHHmmss`.

#### merchant_id
- **Type**: `string`
- **Required**: Yes
- **Description**: A unique merchant key which provided by ABA Bank.
- **Max Length**: 30 characters

#### tran_id
- **Type**: `string`
- **Required**: Yes
- **Description**: This is the unique transaction ID that identifies the transaction.
- **Max Length**: 20 characters

#### first_name
- **Type**: `string`
- **Required**: No
- **Description**: Payer's first name.
- **Max Length**: 20 characters

#### last_name
- **Type**: `string`
- **Required**: No
- **Description**: Payer's last name.
- **Max Length**: 20 characters

#### email
- **Type**: `string`
- **Required**: No
- **Description**: Payer's email address.
- **Max Length**: 50 characters

#### phone
- **Type**: `string`
- **Required**: No
- **Description**: Payer's phone number.
- **Max Length**: 20 characters

#### amount
- **Type**: `number`
- **Required**: Yes
- **Description**: The total transaction amount must be at least 100 KHR or 0.01 USD and cannot be null.

#### currency
- **Type**: `string`
- **Required**: Yes
- **Description**: Supported transaction currencies: `KHR` and `USD`. Not case-sensitive.
- **Max Length**: 3 characters

#### purchase_type
- **Type**: `string`
- **Required**: No
- **Description**: Supported values: `pre-auth` and `purchase`. If the merchant does not provide a value, the default will be `purchase`.
  
  **Note**: Alipay & WeChat do not support pre-auth.
- **Max Length**: 20 characters

#### payment_option
- **Type**: `string`
- **Required**: Yes
- **Description**: Supported payment options:
  - `abapay_khqr`: PayWay will respond with ABA KHQR.
  - `wechat`: PayWay will respond with a WeChat QR (only for USD transactions).
  - `alipay`: PayWay will respond with an Alipay QR (only for USD transactions).
- **Max Length**: 20 characters

#### items
- **Type**: `string`
- **Required**: No
- **Description**: Item list description in Base64-encoded JSON format. Maximum of 10 items.

**PHP Sample Code:**
```php
$items = base64_encode('[
    {"name":"Item 1","quantity":1,"price":1.00},
    {"name":"Item 2","quantity":1,"price":4.00}
]');
```
- **Max Length**: 500 characters

#### callback_url
- **Type**: `string`
- **Required**: No
- **Description**: URL to receive callbacks upon payment completion, encrypted with Base64.

**PHP Sample Code:**
```php
$callback_url = base64_encode('YOUR CALL BACK URL');
```
- **Max Length**: 255 characters

#### return_deeplink
- **Type**: `string`
- **Required**: No

**PHP Sample Code:**
```php
$return_deeplink = base64_encode('{"android_scheme": "{YOUR ANDROID SCHEME}", "ios_scheme":"{YOUR IOS SCHEME}"}');
```
- **Max Length**: 255 characters

#### custom_fields
- **Type**: `string`
- **Required**: No
- **Description**: Additional custom fields to attach to the QR, encrypted with Base64.

**PHP Sample Code:**
```php
$custom_fields = base64_encode('{"Province":"ABC", "Province": "Male" }');
```
- **Max Length**: 255 characters

#### return_params
- **Type**: `string`
- **Required**: No
- **Description**: Additional information to include in the pushback once the payment is completed.

**PHP Sample Code:**
```php
$return_params = '{"key_1": "Value 1","key_2": "Value 2"}';
```

#### payout
- **Type**: `string`
- **Required**: No
- **Description**: Payout instructions in a Base64-encoded JSON string.

**PHP Sample Code:**
```php
$payout = base64_encode('[
    {"account":"201030101","amount":1.72},
    {"account":"012538302","amount":1.72}
]');
```
- **Max Length**: 255 characters

#### lifetime
- **Type**: `integer`
- **Required**: Yes
- **Description**: Transaction lifetime in minutes. Default: 30 days.
  - **Minimum**: 3 mins
  - **Maximum**: 30 days

#### qr_image_template
- **Type**: `string`
- **Required**: Yes
- **Description**: The QR image comes with various options to suit your needs. Please refer to the link below for details templates.
- **Max Length**: 20 characters

#### hash
- **Type**: `string`
- **Required**: Yes
- **Description**: Base64 encode of hash hmac sha512 encryption of concatenated values `req_time`, `merchant_id`, `tran_id`, `amount`, `items`, `first_name`, `last_name`, `email`, `phone`, `purchase_type`, `payment_option`, `callback_url`, `return_deeplink`, `currency`, `custom_fields`, `return_params`, `payout`, `lifetime`, and `qr_image_template`.

**PHP Sample Code:**
```php
// public key provided by ABA Bank
$api_key = 'API KEY PROVIDED BY ABA BANK';

// Prepare the data to be hashed
$b4hash = $req_time . $merchant_id . $tran_id . $amount . $items . $first_name . $last_name . $email . $phone . $purchase_type . $payment_option . $callback_url . $return_deeplink . $currency . $custom_fields . $return_params . $payout . $lifetime . $qr_image_template;

// Generate the HMAC hash using SHA-512 and encode it in Base64 
$hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key, true));
```

### Request Example
```json
{
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
}
```

---

## Responses

### 🟢 200 - Success (application/json)

#### Response Body

- **qrString** (string, required): QR content as string.

- **qrImage** (string, required): QR as base64 image.

- **abapay_deeplink** (string, required): ABA Mobile Deeplink. You can use this deeplink to automatically open ABA Mobile so that customer can confirm payment.

- **app_store** (string, required): If you try to open `abapay_deeplink` and the payer does not have ABA Mobile installed, you can redirect the user to the app store to download ABA Mobile.

- **play_store** (string, required): If you try to open `abapay_deeplink` and the payer does not have ABA Mobile installed, you can redirect the user to the play store to download ABA Mobile.

- **amount** (number, required): Transaction amount.

- **currency** (string, required): Transaction currency.

#### status (object, required)

- **code** (string, required): Possible response codes:
  - `0`: Success.
  - `1`: Wrong Hash.
  - `6`: Requested Domain is not in whitelist.
  - `8`: Something went wrong. Please reach out to our digital support team for assistance.
  - `12`: Payment currency is not allowed.
  - `16`: Invalid First Name. It must not contain numbers or special characters or not more than 100 characters.
  - `17`: Invalid Last Name. It must not contain numbers or special characters or not more than 100 characters.
  - `18`: Invalid Phone Number.
  - `19`: Invalid Email.
  - `21`: End of API lifetime.
  - `23`: Selected Payment Option is not enabled for this Merchant Profile.
  - `32`: Service is not enabled.
  - `35`: Payout Info is invalid.
  - `44`: Purchase amount has reached transaction limit.
  - `47`: KHR Amount must be greater than 100 KHR.
  - `48`: Something went wrong with requested parameters. Please try again or contact the merchant for help.
  - `96`: Invalid merchant data.
  - `102`: The URL is not in the whitelist.
  - `403`: Duplicated Transaction ID.
  - `429`: You've reached the maximum attempt limit. Please try again in (min).

- **message** (string, required): Please see the property response code for the details.

- **trace_id** (string, required): A unique identifier assigned to a request to help track its journey through a system.

### Response Example
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