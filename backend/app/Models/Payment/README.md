# Payment Models

This folder contains all payment-related models for the booking system.

## Models

### Payment
The main payment model that tracks payment transactions for bookings.

**Relationships:**
- `belongsTo`: Booking
- `belongsTo`: PaymentMethod
- `hasMany`: PaymentEvents

**Statuses:**
- `pending`: Payment initiated but not yet processed
- `processing`: Payment is being processed by the provider
- `success`: Payment completed successfully
- `failed`: Payment failed
- `refunded`: Payment has been refunded

**Methods:**
- `isPending()`: Check if payment is pending
- `isProcessing()`: Check if payment is being processed
- `isSuccess()`: Check if payment was successful
- `isFailed()`: Check if payment failed
- `isRefunded()`: Check if payment was refunded
- `markAsProcessing()`: Update status to processing
- `markAsSuccess(?string $transactionId)`: Update status to success
- `markAsFailed()`: Update status to failed
- `markAsRefunded()`: Update status to refunded

**Scopes:**
- `pending()`: Get pending payments
- `processing()`: Get processing payments
- `success()`: Get successful payments
- `failed()`: Get failed payments
- `refunded()`: Get refunded payments

### PaymentMethod
Manages available payment methods (e.g., credit card, PayPal, Stripe).

**Relationships:**
- `hasMany`: Payments

**Methods:**
- `isActive()`: Check if payment method is active
- `activate()`: Activate the payment method
- `deactivate()`: Deactivate the payment method

**Scopes:**
- `active()`: Get active payment methods
- `inactive()`: Get inactive payment methods

### PaymentEvent
Logs all events related to payments (callbacks, webhooks, errors, etc.).

**Relationships:**
- `belongsTo`: Payment

**Event Types:**
- `callback`: Payment provider callback
- `webhook`: Payment provider webhook
- `notification`: Payment notification
- `refund`: Refund event
- `error`: Error event
- `timeout`: Timeout event

**Methods:**
- `isCallback()`: Check if event is a callback
- `isWebhook()`: Check if event is a webhook
- `isNotification()`: Check if event is a notification
- `isRefund()`: Check if event is a refund
- `isError()`: Check if event is an error
- `isTimeout()`: Check if event is a timeout

**Scopes:**
- `callback()`: Get callback events
- `webhook()`: Get webhook events
- `notification()`: Get notification events
- `refund()`: Get refund events
- `error()`: Get error events
- `timeout()`: Get timeout events

## Usage Example

```php
use App\Models\Payment\Payment;
use App\Models\Payment\PaymentMethod;
use App\Models\Payment\PaymentEvent;

// Create a payment
$payment = Payment::create([
    'booking_id' => $booking->id,
    'payment_method_id' => $paymentMethod->id,
    'amount' => 100.00,
    'status' => 'pending',
]);

// Mark as processing
$payment->markAsProcessing();

// Mark as successful with transaction ID
$payment->markAsSuccess('txn_123456789');

// Log a payment event
$payment->paymentEvents()->create([
    'event_type' => 'webhook',
    'payload' => [
        'transaction_id' => 'txn_123456789',
        'status' => 'success',
        'timestamp' => now(),
    ],
]);

// Get all successful payments for a booking
$successfulPayments = $booking->payments()->success()->get();

// Get active payment methods
$activeMethods = PaymentMethod::active()->get();
```
