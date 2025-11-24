# Booking System Database Design

This document provides a comprehensive overview of the booking system database design, including booking management and payment processing.

## Table of Contents
- [Overview](#overview)
- [Database Schema](#database-schema)
- [Models Documentation](#models-documentation)
- [Relationships](#relationships)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

The booking system is designed to handle various types of bookings (hotel rooms, bus seats, tours, restaurants) with integrated payment processing. The system follows clean code architecture principles and uses Laravel's Eloquent ORM.

---

## Database Schema

### Core Tables

#### 1. bookings
Stores the main booking information.

```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. booking_items
Stores individual items within a booking (polymorphic).

```sql
CREATE TABLE booking_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('hotel_room', 'bus_seat', 'tour', 'restaurant') NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

#### 3. booking_hotel_details
Stores hotel-specific booking information.

```sql
CREATE TABLE booking_hotel_details (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    booking_item_id BIGINT UNSIGNED NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (booking_item_id) REFERENCES booking_items(id) ON DELETE CASCADE
);
```

### Payment Tables

#### 4. payment_methods
Stores available payment methods.

```sql
CREATE TABLE payment_methods (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

#### 5. payments
Tracks payment transactions for bookings.

```sql
CREATE TABLE payments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    payment_method_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'processing', 'success', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);
```

#### 6. payment_events
Logs all payment-related events.

```sql
CREATE TABLE payment_events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT UNSIGNED NOT NULL,
    event_type ENUM('callback', 'webhook', 'notification', 'refund', 'error', 'timeout') NOT NULL,
    payload JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
```

---

## Models Documentation

### Booking Models

#### 1. Booking.php
The main booking model that represents a customer's booking.

**Location:** `app/Models/Booking/Booking.php`

**Attributes:**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `total_amount` - Total booking amount (decimal)
- `currency` - Currency code (default: USD)
- `status` - Booking status (pending, confirmed, cancelled, refunded)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `user()` - BelongsTo User
- `bookingItems()` - HasMany BookingItem
- `payments()` - HasMany Payment

**Scopes:**
- `status($status)` - Filter by specific status
- `pending()` - Get pending bookings
- `confirmed()` - Get confirmed bookings
- `cancelled()` - Get cancelled bookings
- `refunded()` - Get refunded bookings

**Helper Methods:**
- `isPending()` - Check if booking is pending
- `isConfirmed()` - Check if booking is confirmed
- `isCancelled()` - Check if booking is cancelled
- `isRefunded()` - Check if booking is refunded

---

#### 2. BookingItem.php
Represents individual items within a booking (hotel rooms, bus seats, tours, restaurants).

**Location:** `app/Models/Booking/BookingItem.php`

**Attributes:**
- `id` - Primary key
- `booking_id` - Foreign key to bookings table
- `item_type` - Type of item (hotel_room, bus_seat, tour, restaurant)
- `item_id` - ID of the bookable item
- `quantity` - Number of items booked
- `unit_price` - Price per unit
- `total_price` - Total price for this item
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `booking()` - BelongsTo Booking
- `hotelDetails()` - HasOne BookingHotelDetail (for hotel rooms)
- `bookable()` - MorphTo (polymorphic relation to the actual item)
- `room()` - BelongsTo Room (helper for hotel bookings)

**Scopes:**
- `itemType($type)` - Filter by specific item type
- `hotelRooms()` - Get hotel room bookings
- `busSeats()` - Get bus seat bookings
- `tours()` - Get tour bookings
- `restaurants()` - Get restaurant bookings

**Helper Methods:**
- `isHotelRoom()` - Check if item is a hotel room
- `isBusSeat()` - Check if item is a bus seat
- `isTour()` - Check if item is a tour
- `isRestaurant()` - Check if item is a restaurant

---

#### 3. BookingHotelDetail.php
Stores hotel-specific booking details like check-in/check-out dates.

**Location:** `app/Models/Booking/BookingHotelDetail.php`

**Attributes:**
- `id` - Primary key
- `booking_item_id` - Foreign key to booking_items table
- `check_in` - Check-in date
- `check_out` - Check-out date
- `nights` - Number of nights
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `bookingItem()` - BelongsTo BookingItem
- `booking()` - HasOneThrough Booking

**Scopes:**
- `active()` - Get currently active bookings
- `upcoming()` - Get upcoming bookings
- `past()` - Get past bookings

**Helper Methods:**
- `calculateNights()` - Calculate nights between check-in and check-out
- `isCheckInPast()` - Check if check-in date has passed
- `isCheckOutPast()` - Check if check-out date has passed
- `isActive()` - Check if booking is currently active
- `isUpcoming()` - Check if booking is upcoming

---

### Payment Models

#### 4. Payment.php
The main payment model that tracks payment transactions for bookings.

**Location:** `app/Models/Payment/Payment.php`

**Attributes:**
- `id` - Primary key
- `booking_id` - Foreign key to bookings table
- `payment_method_id` - Foreign key to payment_methods table
- `amount` - Payment amount (decimal)
- `currency` - Currency code (default: USD)
- `status` - Payment status (pending, processing, success, failed, refunded)
- `transaction_id` - External transaction ID from payment provider
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `booking()` - BelongsTo Booking
- `paymentMethod()` - BelongsTo PaymentMethod
- `paymentEvents()` - HasMany PaymentEvent

**Statuses:**
- `pending`: Payment initiated but not yet processed
- `processing`: Payment is being processed by the provider
- `success`: Payment completed successfully
- `failed`: Payment failed
- `refunded`: Payment has been refunded

**Methods:**
- `isPending()` - Check if payment is pending
- `isProcessing()` - Check if payment is being processed
- `isSuccess()` - Check if payment was successful
- `isFailed()` - Check if payment failed
- `isRefunded()` - Check if payment was refunded
- `markAsProcessing()` - Update status to processing
- `markAsSuccess(?string $transactionId)` - Update status to success
- `markAsFailed()` - Update status to failed
- `markAsRefunded()` - Update status to refunded

**Scopes:**
- `pending()` - Get pending payments
- `processing()` - Get processing payments
- `success()` - Get successful payments
- `failed()` - Get failed payments
- `refunded()` - Get refunded payments

---

#### 5. PaymentMethod.php
Manages available payment methods (e.g., credit card, PayPal, Stripe).

**Location:** `app/Models/Payment/PaymentMethod.php`

**Attributes:**
- `id` - Primary key
- `name` - Payment method name
- `code` - Unique payment method code
- `description` - Optional description
- `is_active` - Active status (boolean)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `payments()` - HasMany Payment

**Methods:**
- `isActive()` - Check if payment method is active
- `activate()` - Activate the payment method
- `deactivate()` - Deactivate the payment method

**Scopes:**
- `active()` - Get active payment methods
- `inactive()` - Get inactive payment methods

---

#### 6. PaymentEvent.php
Logs all events related to payments (callbacks, webhooks, errors, etc.).

**Location:** `app/Models/Payment/PaymentEvent.php`

**Attributes:**
- `id` - Primary key
- `payment_id` - Foreign key to payments table
- `event_type` - Type of event (callback, webhook, notification, refund, error, timeout)
- `payload` - JSON payload of the event
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Relationships:**
- `payment()` - BelongsTo Payment

**Event Types:**
- `callback`: Payment provider callback
- `webhook`: Payment provider webhook
- `notification`: Payment notification
- `refund`: Refund event
- `error`: Error event
- `timeout`: Timeout event

**Methods:**
- `isCallback()` - Check if event is a callback
- `isWebhook()` - Check if event is a webhook
- `isNotification()` - Check if event is a notification
- `isRefund()` - Check if event is a refund
- `isError()` - Check if event is an error
- `isTimeout()` - Check if event is a timeout

**Scopes:**
- `callback()` - Get callback events
- `webhook()` - Get webhook events
- `notification()` - Get notification events
- `refund()` - Get refund events
- `error()` - Get error events
- `timeout()` - Get timeout events

---

## Relationships

### Entity Relationship Diagram

```
Users (users table)
  └─→ has many → Bookings (bookings table)
                    ├─→ has many → BookingItems (booking_items table)
                    │                 ├─→ has one → BookingHotelDetails (booking_hotel_details table)
                    │                 └─→ belongs to → Room/BusSeat/Tour/Restaurant (polymorphic)
                    │
                    └─→ has many → Payments (payments table)
                                      ├─→ belongs to → PaymentMethod (payment_methods table)
                                      └─→ has many → PaymentEvents (payment_events table)
```

### Relationship Details

1. **User → Booking**: One-to-Many
   - A user can have multiple bookings
   - Each booking belongs to one user

2. **Booking → BookingItem**: One-to-Many
   - A booking can contain multiple items
   - Each item belongs to one booking

3. **BookingItem → BookingHotelDetail**: One-to-One
   - Hotel room bookings have additional details
   - Each hotel detail belongs to one booking item

4. **BookingItem → Bookable**: Polymorphic
   - Items can reference different bookable types
   - (Room, BusSeat, Tour, Restaurant)

5. **Booking → Payment**: One-to-Many
   - A booking can have multiple payment attempts
   - Each payment belongs to one booking

6. **PaymentMethod → Payment**: One-to-Many
   - A payment method can be used for multiple payments
   - Each payment uses one payment method

7. **Payment → PaymentEvent**: One-to-Many
   - A payment can have multiple events logged
   - Each event belongs to one payment

---

## Usage Examples

### Creating a Complete Booking with Payment

```php
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
use App\Models\Payment\Payment;
use App\Models\Payment\PaymentMethod;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    // Create the main booking
    $booking = Booking::create([
        'user_id' => auth()->id(),
        'total_amount' => 250.00,
        'currency' => 'USD',
        'status' => 'pending',
    ]);

    // Create a booking item for a hotel room
    $bookingItem = BookingItem::create([
        'booking_id' => $booking->id,
        'item_type' => 'hotel_room',
        'item_id' => $roomId,
        'quantity' => 1,
        'unit_price' => 125.00,
        'total_price' => 250.00,
    ]);

    // Add hotel-specific details
    BookingHotelDetail::create([
        'booking_item_id' => $bookingItem->id,
        'check_in' => '2025-11-15',
        'check_out' => '2025-11-17',
        'nights' => 2,
    ]);

    // Create a payment
    $paymentMethod = PaymentMethod::where('code', 'stripe')->active()->first();
    
    $payment = Payment::create([
        'booking_id' => $booking->id,
        'payment_method_id' => $paymentMethod->id,
        'amount' => 250.00,
        'currency' => 'USD',
        'status' => 'pending',
    ]);

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### Processing a Payment

```php
// Mark payment as processing
$payment->markAsProcessing();

// Log a webhook event
$payment->paymentEvents()->create([
    'event_type' => 'webhook',
    'payload' => [
        'provider' => 'stripe',
        'event_id' => 'evt_123456',
        'status' => 'processing',
    ],
]);

// On success
$payment->markAsSuccess('txn_123456789');

// Update booking status
$payment->booking->update(['status' => 'confirmed']);

// Log success event
$payment->paymentEvents()->create([
    'event_type' => 'notification',
    'payload' => [
        'message' => 'Payment successful',
        'transaction_id' => 'txn_123456789',
    ],
]);
```

### Retrieving Bookings with Payments

```php
// Get all confirmed bookings with successful payments
$confirmedBookings = Booking::where('user_id', auth()->id())
    ->confirmed()
    ->with([
        'bookingItems.hotelDetails',
        'bookingItems.room',
        'payments' => function($query) {
            $query->success();
        }
    ])
    ->get();

// Get all upcoming hotel bookings with payment details
$upcomingHotels = BookingHotelDetail::upcoming()
    ->with([
        'bookingItem.booking.user',
        'bookingItem.room.property',
        'bookingItem.booking.payments.paymentMethod'
    ])
    ->get();

// Get all hotel room bookings with failed payments
$failedPaymentBookings = BookingItem::hotelRooms()
    ->whereHas('booking.payments', function($query) {
        $query->failed();
    })
    ->with(['booking.payments', 'hotelDetails'])
    ->get();
```

### Payment Status Updates

```php
$payment = Payment::find($paymentId);

// Check status
if ($payment->isPending()) {
    $payment->markAsProcessing();
}

// Handle different payment outcomes
try {
    // Process payment with provider
    $result = $paymentProvider->process($payment);
    
    if ($result->success) {
        $payment->markAsSuccess($result->transactionId);
        $payment->booking->update(['status' => 'confirmed']);
    } else {
        $payment->markAsFailed();
        
        // Log error event
        $payment->paymentEvents()->create([
            'event_type' => 'error',
            'payload' => [
                'error_code' => $result->errorCode,
                'error_message' => $result->errorMessage,
            ],
        ]);
    }
} catch (\Exception $e) {
    $payment->markAsFailed();
    
    $payment->paymentEvents()->create([
        'event_type' => 'error',
        'payload' => [
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ],
    ]);
}
```

### Refund Processing

```php
$payment = Payment::success()->find($paymentId);

if ($payment) {
    // Process refund with provider
    $refundResult = $paymentProvider->refund($payment->transaction_id);
    
    if ($refundResult->success) {
        // Update payment status
        $payment->markAsRefunded();
        
        // Update booking status
        $payment->booking->update(['status' => 'refunded']);
        
        // Log refund event
        $payment->paymentEvents()->create([
            'event_type' => 'refund',
            'payload' => [
                'refund_id' => $refundResult->refundId,
                'amount' => $payment->amount,
                'refunded_at' => now(),
            ],
        ]);
    }
}
```

### Complex Queries

```php
// Get booking summary with payment information
$userId = auth()->id();
$summary = [
    'total_bookings' => Booking::where('user_id', $userId)->count(),
    'pending' => Booking::where('user_id', $userId)->pending()->count(),
    'confirmed' => Booking::where('user_id', $userId)->confirmed()->count(),
    'cancelled' => Booking::where('user_id', $userId)->cancelled()->count(),
    'total_spent' => Payment::whereHas('booking', function($query) use ($userId) {
        $query->where('user_id', $userId);
    })->success()->sum('amount'),
    'pending_payments' => Payment::whereHas('booking', function($query) use ($userId) {
        $query->where('user_id', $userId);
    })->pending()->count(),
];

// Get all active hotel bookings for today with payment status
$activeToday = BookingHotelDetail::active()
    ->whereHas('bookingItem.booking', function($query) {
        $query->confirmed();
    })
    ->with([
        'bookingItem.room.property',
        'bookingItem.booking.payments' => function($query) {
            $query->latest();
        }
    ])
    ->get();

// Get payment statistics by method
$paymentStats = PaymentMethod::withCount([
    'payments as total_payments',
    'payments as successful_payments' => function($query) {
        $query->success();
    },
    'payments as failed_payments' => function($query) {
        $query->failed();
    }
])->get();
```

---

## Best Practices

### 1. Transaction Management
Always use database transactions when creating bookings with related records:

```php
DB::beginTransaction();
try {
    // Create booking, items, details, and payment
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### 2. Eager Loading
Avoid N+1 query problems by eager loading relationships:

```php
$bookings = Booking::with([
    'bookingItems.hotelDetails',
    'bookingItems.room',
    'payments.paymentMethod',
    'payments.paymentEvents'
])->get();
```

### 3. Use Scopes
Utilize model scopes for common queries:

```php
// Good
$confirmedBookings = Booking::confirmed()->get();
$successfulPayments = Payment::success()->get();

// Avoid
$confirmedBookings = Booking::where('status', 'confirmed')->get();
$successfulPayments = Payment::where('status', 'success')->get();
```

### 4. Validate Data
Always validate item types and payment methods:

```php
$validItemTypes = ['hotel_room', 'bus_seat', 'tour', 'restaurant'];
if (!in_array($itemType, $validItemTypes)) {
    throw new InvalidArgumentException('Invalid item type');
}
```

### 5. Calculate Automatically
Use model events or mutators for automatic calculations:

```php
// In BookingHotelDetail model
protected static function boot()
{
    parent::boot();
    
    static::saving(function ($model) {
        $model->nights = $model->calculateNights();
    });
}
```

### 6. Update Totals
Keep booking total_amount synchronized with items:

```php
$booking->total_amount = $booking->bookingItems()->sum('total_price');
$booking->save();
```

### 7. Log Payment Events
Always log important payment events for auditing:

```php
$payment->paymentEvents()->create([
    'event_type' => 'webhook',
    'payload' => $webhookData,
]);
```

### 8. Handle Failures Gracefully
Implement proper error handling and logging:

```php
try {
    $payment->markAsProcessing();
    // Process payment
    $payment->markAsSuccess($transactionId);
} catch (\Exception $e) {
    $payment->markAsFailed();
    $payment->paymentEvents()->create([
        'event_type' => 'error',
        'payload' => ['error' => $e->getMessage()],
    ]);
}
```

---

## Future Extensions

The booking system is designed to be extensible. To add new booking types:

### Adding New Booking Types

1. **Update the enum** in the `booking_items` migration:
```php
$table->enum('item_type', [
    'hotel_room', 
    'bus_seat', 
    'tour', 
    'restaurant',
    'new_type' // Add new type here
]);
```

2. **Create detail table** if needed (like `booking_hotel_details`):
```php
Schema::create('booking_new_type_details', function (Blueprint $table) {
    $table->id();
    $table->foreignId('booking_item_id')->constrained()->onDelete('cascade');
    // Add type-specific fields
    $table->timestamps();
});
```

3. **Create model** for the new type:
```php
class BookingNewTypeDetail extends Model
{
    protected $fillable = [...];
    
    public function bookingItem()
    {
        return $this->belongsTo(BookingItem::class);
    }
}
```

4. **Add methods** to `BookingItem`:
```php
public function newTypeDetails()
{
    return $this->hasOne(BookingNewTypeDetail::class);
}

public function scopeNewTypes($query)
{
    return $query->where('item_type', 'new_type');
}

public function isNewType()
{
    return $this->item_type === 'new_type';
}
```

### Adding New Payment Methods

1. **Create payment method** record:
```php
PaymentMethod::create([
    'name' => 'New Payment Gateway',
    'code' => 'new_gateway',
    'description' => 'Description of new gateway',
    'is_active' => true,
]);
```

2. **Implement payment service**:
```php
class NewGatewayService
{
    public function process(Payment $payment)
    {
        // Implementation
    }
    
    public function refund(string $transactionId)
    {
        // Implementation
    }
}
```

3. **Handle webhooks**:
```php
Route::post('/webhook/new-gateway', function (Request $request) {
    $payment = Payment::where('transaction_id', $request->transaction_id)->first();
    
    $payment->paymentEvents()->create([
        'event_type' => 'webhook',
        'payload' => $request->all(),
    ]);
    
    // Process webhook
});
```

---

## Status Flow Diagrams

### Booking Status Flow
```
pending → confirmed → (cancelled/refunded)
   ↓
cancelled
```

### Payment Status Flow
```
pending → processing → success → (refunded)
   ↓
failed
```

---

## Index Recommendations

For optimal query performance, consider adding these indexes:

```sql
-- Bookings
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Booking Items
CREATE INDEX idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX idx_booking_items_type ON booking_items(item_type);
CREATE INDEX idx_booking_items_item ON booking_items(item_type, item_id);

-- Booking Hotel Details
CREATE INDEX idx_hotel_details_dates ON booking_hotel_details(check_in, check_out);
CREATE INDEX idx_hotel_details_booking_item ON booking_hotel_details(booking_item_id);

-- Payments
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Payment Events
CREATE INDEX idx_payment_events_payment_type ON payment_events(payment_id, event_type);
CREATE INDEX idx_payment_events_created_at ON payment_events(created_at);

-- Payment Methods
CREATE INDEX idx_payment_methods_code ON payment_methods(code);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);
```

---

## Security Considerations

1. **User Authorization**: Always verify users can only access their own bookings
2. **Payment Validation**: Validate payment amounts match booking totals
3. **Transaction Integrity**: Use database transactions for all multi-step operations
4. **Webhook Security**: Verify webhook signatures from payment providers
5. **Sensitive Data**: Never log full payment card details
6. **Rate Limiting**: Implement rate limiting on payment endpoints
7. **Idempotency**: Use idempotency keys for payment operations

---

## Monitoring and Alerting

Consider monitoring these metrics:

- Failed payment rate
- Average booking completion time
- Payment processing time
- Refund rate
- Active bookings count
- Payment method usage statistics
- Error event frequency

---

This documentation should be updated as the system evolves and new features are added.
