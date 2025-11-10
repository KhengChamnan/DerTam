# Booking Models Documentation

This folder contains the booking-related models for the application, following clean code architecture principles.

## Models Overview

### 1. Booking.php
The main booking model that represents a customer's booking.

**Table:** `bookings`

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

### 2. BookingItem.php
Represents individual items within a booking (hotel rooms, bus seats, tours, restaurants).

**Table:** `booking_items`

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

### 3. BookingHotelDetail.php
Stores hotel-specific booking details like check-in/check-out dates.

**Table:** `booking_hotel_details`

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

## Usage Examples

### Creating a Hotel Booking

```php
use App\Models\Booking\Booking;
use App\Models\Booking\BookingItem;
use App\Models\Booking\BookingHotelDetail;
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
        'item_id' => $roomId, // ID of the room from rooms table
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

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### Retrieving Bookings

```php
// Get all confirmed bookings for a user
$confirmedBookings = Booking::where('user_id', auth()->id())
    ->confirmed()
    ->with(['bookingItems.hotelDetails', 'bookingItems.room'])
    ->get();

// Get all upcoming hotel bookings
$upcomingHotels = BookingHotelDetail::upcoming()
    ->with(['bookingItem.booking.user', 'bookingItem.room'])
    ->get();

// Get all hotel room bookings
$hotelBookings = BookingItem::hotelRooms()
    ->with(['booking', 'hotelDetails'])
    ->get();
```

### Updating Booking Status

```php
$booking = Booking::find($bookingId);

if ($booking->isPending()) {
    $booking->update(['status' => 'confirmed']);
}

// Or using mass update
Booking::where('id', $bookingId)
    ->pending()
    ->update(['status' => 'confirmed']);
```

### Checking Booking Details

```php
$booking = Booking::with(['bookingItems.hotelDetails'])->find($bookingId);

foreach ($booking->bookingItems as $item) {
    if ($item->isHotelRoom()) {
        $hotelDetail = $item->hotelDetails;
        
        if ($hotelDetail->isUpcoming()) {
            echo "Check-in: " . $hotelDetail->check_in->format('Y-m-d');
            echo "Nights: " . $hotelDetail->calculateNights();
        }
    }
}
```

### Complex Queries

```php
// Get all active hotel bookings for today
$activeToday = BookingHotelDetail::active()
    ->whereHas('bookingItem.booking', function($query) {
        $query->confirmed();
    })
    ->with(['bookingItem.room.property'])
    ->get();

// Get booking summary for a user
$userId = auth()->id();
$summary = [
    'total_bookings' => Booking::where('user_id', $userId)->count(),
    'pending' => Booking::where('user_id', $userId)->pending()->count(),
    'confirmed' => Booking::where('user_id', $userId)->confirmed()->count(),
    'cancelled' => Booking::where('user_id', $userId)->cancelled()->count(),
];
```

---

## Database Relationships Diagram

```
Users (users table)
  └─→ has many → Bookings (bookings table)
                    └─→ has many → BookingItems (booking_items table)
                                      └─→ has one → BookingHotelDetails (booking_hotel_details table)
                                      └─→ belongs to → Room (rooms table) [when item_type is 'hotel_room']
```

---

## Best Practices

1. **Always use transactions** when creating bookings with multiple related records
2. **Eager load relationships** to avoid N+1 query problems
3. **Use scopes** for common queries (e.g., `pending()`, `confirmed()`)
4. **Validate item_type** before creating BookingItem records
5. **Calculate nights automatically** before saving BookingHotelDetail
6. **Update booking total_amount** when modifying booking items

---

## Future Extensions

The booking system is designed to be extensible. To add new booking types:

1. Add the new type to the `item_type` enum in the migration
2. Create a new detail table if needed (like `booking_hotel_details`)
3. Add scope methods to `BookingItem` for the new type
4. Create corresponding models for the bookable items

Example for bus seats:
- Create `booking_bus_details` table
- Create `BookingBusDetail` model
- Add `busDetails()` relationship to `BookingItem`
