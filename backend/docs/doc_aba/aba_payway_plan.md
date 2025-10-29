# ABA PayWay (Sandbox) Integration Plan

## Scope

- Implement ABA PayWay QR (generate-qr, sandbox) for booking payments.
- Return QR image + ABA deeplink to Flutter.
- Add webhook/callback to update `booking_details.payment_status` and `status`.
- Support polling booking status by `merchant_ref_no` (already supported in `show`).

## Files To Add/Change

- .env (new variables)
  - `ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_QR_ENDPOINT=https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr`, `ABA_WEBHOOK_VERIFY_KEY` (optional shared secret), `APP_PUBLIC_URL`
- config/services.php (append ABA config)
- app/Services/ABA/PayWayClient.php (new) — build payload, HMAC SHA-512 Base64 hash, POST to ABA, return QR/deeplink
- app/Http/Controllers/API/Payment/ABAPaymentController.php (new)
  - `initiateForBooking(booking_id)` → validates booking, creates `tran_id`, calls PayWayClient, saves `tran_id`, returns QR/deeplink to client
  - `webhook()` → verifies hash/signature, finds booking by `tran_id`, sets `payment_status` and `status=paid` on success
- routes/api.php (append routes)
  - `POST /api/payments/aba/bookings/{booking_id}/initiate` (auth: user)
  - `POST /api/payments/aba/webhook` (no auth; CSRF exempt)
- app/Http/Controllers/API/Hotel/BookingController.php
  - No change required for create; retain `merchant_ref_no`. We’ll set `tran_id` on initiation and use existing `show` (public by `merchant_ref_no`) for polling from Flutter.
- app/Http/Middleware/VerifyCsrfToken.php — add `/api/payments/aba/webhook` to `$except`.

## Key Behaviors

- `tran_id` format: `BK-<booking_id>-<timestamp>`
- Currency: configurable (`USD` or `KHR`); default to `KHR` if not provided.
- Payment option: `abapay_khqr`.
- Lifetime: 10–30 minutes (configurable).
- Items: base64 JSON with a simple line item (e.g., Booking <merchant_ref_no>). Optional.
- Callback URL: `APP_PUBLIC_URL/api/payments/aba/webhook` (base64-encoded per ABA spec).
- Hash: `base64_encode(hash_hmac('sha512', concatenated_fields, ABA_API_KEY, true))`.
- On webhook success (status.code==0): set `payment_status=success`, `status=paid`, `payment_date=now()`; on failure: `failed`.

## API Contracts

- Initiate
  - Request: none (path includes `booking_id`)
  - Response 200:
    - `merchant_ref_no`, `tran_id`, `amount`, `currency`, `qrImage`, `abapay_deeplink`
- Webhook (ABA → us): per ABA payload; we store `status.code`, verify hash.
- Polling (existing): `GET /api/hotel/bookings/{merchant_ref_no}` (public) — Flutter can poll every 2–3s until `payment_status` changes.

## Essential Snippets

- HMAC hash (in `PayWayClient`):
```php
$b4hash = $req_time . $merchant_id . $tran_id . $amount . $items . $first_name . $last_name . $email . $phone . $purchase_type . $payment_option . $callback_url . $return_deeplink . $currency . $custom_fields . $return_params . $payout . $lifetime . $qr_image_template;
$hash = base64_encode(hash_hmac('sha512', $b4hash, $apiKey, true));
```


## Testing

- Unit-test hash builder with fixed inputs.
- Hit initiate endpoint; expect 200 with `qrImage` + deeplink.
- Simulate webhook with sample success payload; booking should become paid.

## Security

- Keep keys in `.env`.
- Validate ABA webhook: verify hash; optionally restrict by ABA IPs if available.
- Do not expose private key in repo (docs file is for local dev only).