# Seat Availability Validation Implementation

## Overview

This document describes the implementation of a comprehensive seat availability validation system for the bus booking platform. The system ensures accurate real-time seat availability checking by properly integrating with the booking status workflow.

---

## Problem Statement

**Before Implementation:**
- Seat validation only checked if a `SeatBooking` record existed
- Cancelled and refunded bookings still blocked seats
- No relationship to the `Booking` model's status field
- Static `available_seats` field could become stale
- Users couldn't see which seats they had already booked

**Issues:**
```php
// Old validation (INCORRECT)
$alreadyBooked = SeatBooking::where('schedule_id', $scheduleId)
    ->whereIn('seat_id', $seatIds)
    ->exists(); // ❌ Ignores booking status
```

---

## Solution Architecture

### 1. Database Structure

The seat booking system uses a multi-table design:

```
Booking (status: pending/confirmed/cancelled/refunded)
  └─→ BookingItem (item_type: 'bus_seat')
       └─→ SeatBooking (booking_id, schedule_id, seat_id)
            ├─→ BusSchedule
            └─→ BusSeat
```

**Key Constraint:**
```sql
UNIQUE(schedule_id, seat_id, booking_id)
-- Prevents double-booking same seat on same schedule
```

**Important:** Seat bookings are **schedule-specific**. A seat booked for Schedule #123 is automatically available for Schedule #456 (different departure time/date).

---

## Implementation Details

### Step 1: Enable `booking()` Relationship

**File:** `app/Models/Bus/SeatBooking.php`

**Change:**
```php
/**
 * Get the booking for this seat booking.
 * This relationship is crucial for checking booking status
 * (pending, confirmed, cancelled, refunded)
 */
public function booking(): BelongsTo
{
    return $this->belongsTo(\App\Models\Booking\Booking::class, 'booking_id', 'id');
}
```

**Purpose:** Enables querying booking status through Eloquent relationships.

---

### Step 2: Create `getSeatAvailability()` Method

**File:** `app/Models/Bus/BusSeat.php`

**Method Signature:**
```php
public static function getSeatAvailability(int $scheduleId, ?array $seatIds = null): array
```

**Implementation:**
```php
public static function getSeatAvailability(int $scheduleId, ?array $seatIds = null): array
{
    $schedule = \App\Models\Bus\BusSchedule::findOrFail($scheduleId);
    
    // Get all seats for the bus or specific seats
    $seatsQuery = self::where('bus_id', $schedule->bus_id);
    
    if ($seatIds !== null) {
        $seatsQuery->whereIn('id', $seatIds);
    }
    
    $seats = $seatsQuery->pluck('id')->toArray();
    
    // Get booked seat IDs for this schedule with active bookings
    $bookedSeatIds = SeatBooking::where('schedule_id', $scheduleId)
        ->whereIn('seat_id', $seats)
        ->whereHas('booking', function($query) {
            $query->whereIn('status', ['pending', 'confirmed']);
        })
        ->pluck('seat_id')
        ->toArray();
    
    // Map all seats to availability status
    $availability = [];
    foreach ($seats as $seatId) {
        $availability[$seatId] = !in_array($seatId, $bookedSeatIds);
    }
    
    return $availability;
}
```

**Returns:**
```php
[
    1 => true,   // Seat ID 1 is available
    2 => false,  // Seat ID 2 is booked
    3 => true,   // Seat ID 3 is available
    // ...
]
```

**Key Features:**
- Only considers `pending` and `confirmed` bookings as blocking
- Cancelled and refunded bookings are treated as available
- Returns boolean map for easy status checking
- Optionally filters specific seat IDs for performance

---

### Step 3: Update Booking Validation

**File:** `app/Http/Controllers/API/Booking/BusBookingController.php`

**Before:**
```php
$alreadyBooked = \App\Models\Bus\SeatBooking::where('schedule_id', $request->schedule_id)
    ->whereIn('seat_id', $request->seat_ids)
    ->exists();
```

**After:**
```php
// Check if seats are already booked with active bookings
$alreadyBooked = \App\Models\Bus\SeatBooking::where('schedule_id', $request->schedule_id)
    ->whereIn('seat_id', $request->seat_ids)
    ->whereHas('booking', function($query) {
        $query->whereIn('status', ['pending', 'confirmed']);
    })
    ->exists();
```

**Impact:** Cancelled/refunded bookings no longer block seat availability.

---

### Step 4: Real-Time Seat Status in UI

**File:** `app/Http/Controllers/API/Bus/BusScheduleController.php`

**Method:** `getScheduleDetail($id)`

**Before (TODO comment):**
```php
// TODO: Implement seat status logic
// Check if seat is booked for this schedule
// For now, all seats are available (null status)
$status = 'available';
```

**After:**
```php
// Get seat availability for this schedule
$seatAvailability = \App\Models\Bus\BusSeat::getSeatAvailability($id);

// Get current user's booked seats for this schedule (if authenticated)
$userBookedSeatIds = [];
if (auth()->check()) {
    $userBookedSeatIds = \App\Models\Bus\SeatBooking::where('schedule_id', $id)
        ->whereHas('booking', function($query) {
            $query->where('user_id', auth()->id())
                  ->whereIn('status', ['pending', 'confirmed']);
        })
        ->pluck('seat_id')
        ->toArray();
}

// Determine seat status
if (in_array($seat->id, $userBookedSeatIds)) {
    $status = 'your_seat';
} elseif (isset($seatAvailability[$seat->id]) && $seatAvailability[$seat->id]) {
    $status = 'available';
} else {
    $status = 'booked';
}
```

**Seat Status Values:**
- `'available'` - Seat is free to book
- `'booked'` - Seat is taken by another user (active booking)
- `'your_seat'` - Current authenticated user has booked this seat

**Frontend Usage:**
```typescript
// Color coding example
if (seat.status === 'available') {
    color = 'green'; // User can select
} else if (seat.status === 'your_seat') {
    color = 'blue';  // Already booked by user
} else {
    color = 'gray';  // Booked by someone else
}
```

---

### Step 5: Real-Time Available Seats Count

**File:** `app/Models/Bus/BusSchedule.php`

**Method:**
```php
/**
 * Get the real-time count of available seats for this schedule.
 * Calculates: Total bus seats - Seats with active bookings (pending or confirmed).
 *
 * @return int Number of available seats
 */
public function getAvailableSeatsCount(): int
{
    // Get total seats for this bus
    $totalSeats = \App\Models\Bus\BusSeat::where('bus_id', $this->bus_id)->count();
    
    // Get count of booked seats with active bookings
    $bookedSeats = SeatBooking::where('schedule_id', $this->id)
        ->whereHas('booking', function($query) {
            $query->whereIn('status', ['pending', 'confirmed']);
        })
        ->count();
    
    return max(0, $totalSeats - $bookedSeats);
}
```

**Usage in Controllers:**

**Updated in 3 locations:**

1. **`searchBusSchedules()`** - Schedule search results
2. **`getUpcomingJourneys()`** - Homepage upcoming journeys
3. **`getScheduleDetail()`** - Schedule detail page

**Before:**
```php
'available_seats' => $schedule->available_seats, // ❌ Static field
```

**After:**
```php
'available_seats' => $schedule->getAvailableSeatsCount(), // ✅ Real-time calculation
```

**Benefits:**
- Always accurate, never stale
- Automatically adjusts when bookings are cancelled/refunded
- No need to manually update cached counts

---

## API Response Examples

### 1. Schedule Search Response

```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 15,
        "bus_name": "Express Liner",
        "from_location": "Phnom Penh",
        "to_location": "Siem Reap",
        "departure_time": "8 AM, Mon",
        "price": "15.00",
        "available_seats": 28  // ✅ Real-time count
      }
    ]
  }
}
```

### 2. Schedule Detail with Seat Layout

```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 15,
      "available_seats": 28
    },
    "seat_layout": {
      "lower_deck": {
        "columns": ["A", "B", "C", "D"],
        "seats": [
          {
            "id": 101,
            "seat_no": "A1",
            "status": "available"  // ✅ User can book
          },
          {
            "id": 102,
            "seat_no": "A2",
            "status": "booked"     // ❌ Taken by someone else
          },
          {
            "id": 103,
            "seat_no": "A3",
            "status": "your_seat"  // 🔵 User's booking
          }
        ]
      },
      "upper_deck": { /* ... */ }
    }
  }
}
```

---

## Booking Status Workflow

### Status Definitions

| Status | Description | Blocks Seat? |
|--------|-------------|--------------|
| `pending` | Payment not yet confirmed | ✅ Yes |
| `confirmed` | Payment successful, active booking | ✅ Yes |
| `cancelled` | User cancelled or payment failed | ❌ No |
| `refunded` | Payment was refunded | ❌ No |

### Status Transitions

```
[Create Booking]
      ↓
  ⏳ pending ─────────────→ ❌ cancelled
      ↓                          ↑
   [Payment                      |
    Success]              [Payment Failed]
      ↓                          |
  ✅ confirmed ──────────────────┘
      ↓
   [Refund]
      ↓
  💰 refunded
```

---

## Schedule Lifecycle and Seat Isolation

### Key Concept: Schedule-Specific Bookings

Each `SeatBooking` is tied to a specific `schedule_id`, meaning:

**✅ Correct Behavior:**
- Seat A1 booked for Schedule #123 (Phnom Penh → Siem Reap, 8 AM Monday)
- Seat A1 is **AVAILABLE** for Schedule #456 (Phnom Penh → Siem Reap, 2 PM Monday)
- Same bus, same route, different time = different schedule = independent availability

**Database Constraint:**
```sql
UNIQUE(schedule_id, seat_id, booking_id)
```
This ensures:
- One seat cannot be booked twice for the same schedule
- Same seat can be booked for different schedules
- Each booking is isolated per schedule instance

### Schedule Status Lifecycle

| Status | Description | Bookable? |
|--------|-------------|-----------|
| `scheduled` | Future departure | ✅ Yes |
| `departed` | Bus has left | ❌ No |
| `cancelled` | Trip cancelled | ❌ No |
| `completed` | Trip finished | ❌ No |

**Recommended:** Add validation in `BusBookingController` to reject bookings for non-scheduled trips:

```php
// Before processing booking
if (!in_array($schedule->status, ['scheduled'])) {
    return response()->json([
        'success' => false,
        'message' => 'This schedule is not available for booking',
    ], 400);
}
```

---

## Performance Considerations

### 1. Database Queries

**Optimized Query with Relationship:**
```php
// ✅ Single query with join
SeatBooking::where('schedule_id', $scheduleId)
    ->whereHas('booking', function($query) {
        $query->whereIn('status', ['pending', 'confirmed']);
    })
    ->get();
```

**Vs. N+1 Problem:**
```php
// ❌ Multiple queries
foreach ($seatBookings as $seatBooking) {
    if ($seatBooking->booking->status === 'confirmed') {
        // N+1 queries!
    }
}
```

### 2. Caching Strategy (Optional)

For high-traffic schedules, consider caching:

```php
use Illuminate\Support\Facades\Cache;

public function getAvailableSeatsCount(): int
{
    $cacheKey = "schedule_{$this->id}_available_seats";
    
    return Cache::remember($cacheKey, now()->addMinutes(5), function() {
        $totalSeats = BusSeat::where('bus_id', $this->bus_id)->count();
        $bookedSeats = SeatBooking::where('schedule_id', $this->id)
            ->whereHas('booking', function($query) {
                $query->whereIn('status', ['pending', 'confirmed']);
            })
            ->count();
        
        return max(0, $totalSeats - $bookedSeats);
    });
}
```

**Cache Invalidation:**
```php
// After creating booking
Cache::forget("schedule_{$scheduleId}_available_seats");

// After cancelling booking
Cache::forget("schedule_{$scheduleId}_available_seats");
```

### 3. Database Indexing

**Recommended Indexes:**

```sql
-- For fast seat availability lookups
CREATE INDEX idx_seat_bookings_schedule_seat 
ON booking_bus_seats(schedule_id, seat_id);

-- For filtering by booking status
CREATE INDEX idx_bookings_status 
ON bookings(status);

-- For user's bookings lookup
CREATE INDEX idx_bookings_user_status 
ON bookings(user_id, status);
```

---

## Testing Scenarios

### Test Case 1: Cancelled Booking Frees Seat

```php
// 1. Book seat A1 for schedule #10
$booking = createBooking(['seat_ids' => [1], 'schedule_id' => 10]);
$booking->update(['status' => 'confirmed']);

// 2. Check availability
$availability = BusSeat::getSeatAvailability(10);
assertEquals(false, $availability[1]); // Seat is booked

// 3. Cancel booking
$booking->update(['status' => 'cancelled']);

// 4. Check availability again
$availability = BusSeat::getSeatAvailability(10);
assertEquals(true, $availability[1]); // ✅ Seat is now available
```

### Test Case 2: Schedule Isolation

```php
// 1. Book seat A1 for schedule #10
createBooking(['seat_ids' => [1], 'schedule_id' => 10]);

// 2. Check seat A1 availability for different schedule
$availability = BusSeat::getSeatAvailability(20); // Different schedule
assertEquals(true, $availability[1]); // ✅ Available for schedule #20
```

### Test Case 3: User's Own Seats

```php
// 1. User books seats A1, A2
$user = auth()->user();
createBooking([
    'user_id' => $user->id,
    'seat_ids' => [1, 2],
    'schedule_id' => 10
]);

// 2. Get schedule detail
$response = $this->get("/api/bus/schedule/10");

// 3. Verify seat status
$seats = $response->json('data.seat_layout.lower_deck.seats');
assertEquals('your_seat', $seats[0]['status']); // Seat A1
assertEquals('your_seat', $seats[1]['status']); // Seat A2
assertEquals('available', $seats[2]['status']); // Seat A3
```

---

## Migration Considerations

### No Database Changes Required

✅ All changes are **code-only** - no migrations needed.

The `booking_bus_seats` table already has:
- `booking_id` field linking to `bookings` table
- Unique constraint on `(schedule_id, seat_id, booking_id)`

### Backward Compatibility

**Old Code:**
```php
// This still works but is deprecated
$seat->isBookedForSchedule($scheduleId);
```

**New Code:**
```php
// Use this instead
$availability = BusSeat::getSeatAvailability($scheduleId);
$isAvailable = $availability[$seatId];
```

---

## Future Enhancements

### 1. Concurrent Booking Protection

Prevent race conditions when multiple users book the last seat simultaneously:

```php
DB::transaction(function() use ($request) {
    // Lock seats for update
    $seats = BusSeat::whereIn('id', $request->seat_ids)
        ->lockForUpdate()
        ->get();
    
    // Re-check availability with lock
    $alreadyBooked = SeatBooking::where('schedule_id', $scheduleId)
        ->whereIn('seat_id', $request->seat_ids)
        ->whereHas('booking', function($query) {
            $query->whereIn('status', ['pending', 'confirmed']);
        })
        ->exists();
    
    if ($alreadyBooked) {
        throw new \Exception('Seats no longer available');
    }
    
    // Create booking
    createBooking($request);
});
```

### 2. Seat Hold/Reservation Timer

Allow users to "hold" seats for 10 minutes while completing payment:

```php
// Add to bookings table
$table->timestamp('hold_expires_at')->nullable();

// Check holds in availability query
$query->where(function($q) {
    $q->whereIn('status', ['pending', 'confirmed'])
      ->orWhere(function($q2) {
          $q2->where('status', 'hold')
             ->where('hold_expires_at', '>', now());
      });
});
```

### 3. Schedule Auto-Status Updates

Automatically update schedule status based on time:

```php
// app/Console/Commands/UpdateBusScheduleStatuses.php
Schedule::where('status', 'scheduled')
    ->where('departure_time', '<', now())
    ->update(['status' => 'departed']);

Schedule::where('status', 'departed')
    ->where('arrival_time', '<', now())
    ->update(['status' => 'completed']);
```

---

## Summary

### Files Modified

1. ✅ `app/Models/Bus/SeatBooking.php` - Enabled `booking()` relationship
2. ✅ `app/Models/Bus/BusSeat.php` - Added `getSeatAvailability()` method
3. ✅ `app/Models/Bus/BusSchedule.php` - Added `getAvailableSeatsCount()` method
4. ✅ `app/Http/Controllers/API/Booking/BusBookingController.php` - Updated validation
5. ✅ `app/Http/Controllers/API/Bus/BusScheduleController.php` - Real-time seat status

### Key Benefits

- ✅ Accurate real-time seat availability
- ✅ Cancelled/refunded bookings free seats automatically
- ✅ Users can see their own booked seats
- ✅ Schedule-specific booking isolation
- ✅ No stale cached data
- ✅ Proper booking status integration

### Booking Status Logic

**Active Bookings (Block Seats):**
- `pending` - Payment processing
- `confirmed` - Active booking

**Inactive Bookings (Don't Block Seats):**
- `cancelled` - Booking cancelled
- `refunded` - Payment refunded

---

## Support

For questions or issues:
- Review the plan document: `docs/plan-seatBookingLifecycleAndScheduleIndependence.prompt.md`
- Check database constraints: `database/migrations/2025_11_08_000005_create_seat_bookings_table.php`
- Test with Postman: `docs/booking_postman_collection.json`
