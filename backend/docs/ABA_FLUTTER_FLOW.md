# Flutter Payment Flow (ABA PayWay KHQR)

1. Create booking (auth): POST `/api/hotels/bookings` → get `booking_id`, `merchant_ref_no`.
2. Initiate payment (auth): POST `/api/payments/aba/bookings/{booking_id}/initiate` → get `qrImage`, `abapay_deeplink`.
3. Show QR or open deeplink in ABA Mobile.
4. Webhook updates status: POST `/api/payments/aba/webhook` (server→server).
5. Poll status: GET `/api/hotels/bookings/{merchant_ref_no}` until `payment_status` is `success` or `failed`.

Env vars: `ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_QR_ENDPOINT`, `ABA_CALLBACK_URL`, `ABA_DEFAULT_CURRENCY`, `ABA_DEFAULT_LIFETIME`, `ABA_QR_IMAGE_TEMPLATE`, `ABA_WEBHOOK_VERIFY_KEY` (optional).
