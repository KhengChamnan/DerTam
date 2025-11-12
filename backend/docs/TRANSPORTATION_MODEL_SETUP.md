# Transportation Model Setup Summary

## ✅ Models Created

All models follow the same pattern as the Hotel Property model with proper relationships and owner assignment.

### 1. **Transportation.php** (Main Model)

**Location:** `/backend/app/Models/Transportation.php`

**Table:** `buses`

**Relationships:**

-   `owner()` - BelongsTo User (via `owner_user_id`)
-   `seats()` - HasMany TransportationSeat
-   `schedules()` - HasMany TransportationSchedule
-   `activeSchedules()` - HasMany TransportationSchedule (filtered by status)

**Fillable Fields:**

-   `bus_name` (nullable)
-   `bus_plate` (nullable)
-   `seat_capacity` (required)
-   `owner_user_id` (required)

---

### 2. **TransportationSeat.php**

**Location:** `/backend/app/Models/TransportationSeat.php`

**Table:** `bus_seats`

**Relationships:**

-   `bus()` - BelongsTo Transportation

**Fillable Fields:**

-   `bus_id`
-   `seat_number`

---

### 3. **TransportationRoute.php**

**Location:** `/backend/app/Models/TransportationRoute.php`

**Table:** `routes`

**Relationships:**

-   `schedules()` - HasMany TransportationSchedule

**Fillable Fields:**

-   `from_location`
-   `to_location`
-   `distance_km` (nullable)
-   `duration_hours` (nullable)

---

### 4. **TransportationSchedule.php**

**Location:** `/backend/app/Models/TransportationSchedule.php`

**Table:** `bus_schedules`

**Relationships:**

-   `bus()` - BelongsTo Transportation
-   `route()` - BelongsTo TransportationRoute
-   `seatBookings()` - HasMany TransportationBookingSeat

**Fillable Fields:**

-   `bus_id`
-   `route_id`
-   `departure_time`
-   `arrival_time` (nullable)
-   `price`
-   `available_seats` (nullable)
-   `status` (enum: scheduled, departed, cancelled, completed)

**Scopes:**

-   `scheduled()` - Get only scheduled trips
-   `active()` - Get scheduled or departed trips

---

### 5. **TransportationBookingSeat.php**

**Location:** `/backend/app/Models/TransportationBookingSeat.php`

**Table:** `booking_bus_seats`

**Relationships:**

-   `schedule()` - BelongsTo TransportationSchedule
-   `seat()` - BelongsTo TransportationSeat

**Fillable Fields:**

-   `schedule_id`
-   `seat_id`
-   `price`

---

## ✅ Migrations Created

### 1. **2025_11_10_000001_create_buses_table.php**

Creates the main `buses` table with:

-   `owner_user_id` foreign key to `users` table
-   Cascade delete when owner is deleted

### 2. **2025_11_10_000002_create_bus_seats_table.php**

Creates `bus_seats` table with:

-   Foreign key to `buses`
-   Unique constraint on `(bus_id, seat_number)`

### 3. **2025_11_10_000003_create_routes_table.php**

Creates `routes` table for storing route information

### 4. **2025_11_10_000004_create_bus_schedules_table.php**

Creates `bus_schedules` table with:

-   Foreign keys to `buses` and `routes`
-   Status enum field
-   Indexes for performance

### 5. **2025_11_10_000005_create_booking_bus_seats_table.php**

Creates `booking_bus_seats` table with:

-   Foreign keys to `bus_schedules` and `bus_seats`
-   Unique constraint to prevent double-booking

---

## ✅ User Model Updated

Added relationship method in `/backend/app/Models/User.php`:

```php
public function ownedTransportations()
{
    return $this->hasMany(\App\Models\Transportation::class, 'owner_user_id', 'id');
}
```

Now users can access their owned buses:

```php
$user->ownedTransportations; // Get all buses owned by this user
```

---

## 🚀 How to Use

### 1. Run Migrations

```bash
php artisan migrate
```

### 2. Create a Transportation with Owner

```php
use App\Models\Transportation;
use App\Models\TransportationSeat;

// Create a bus
$bus = Transportation::create([
    'bus_name' => 'Giant Ibis Express 01',
    'bus_plate' => '1A-2345',
    'seat_capacity' => 40,
    'owner_user_id' => $ownerId,
]);

// Auto-generate seats
for ($i = 1; $i <= $bus->seat_capacity; $i++) {
    TransportationSeat::create([
        'bus_id' => $bus->id,
        'seat_number' => 'A' . $i,
    ]);
}
```

### 3. Access Relationships

```php
// Get bus owner
$owner = $bus->owner;

// Get all seats
$seats = $bus->seats;

// Get all schedules
$schedules = $bus->schedules;

// Get only active schedules
$activeSchedules = $bus->activeSchedules;

// From owner side
$ownedBuses = $user->ownedTransportations;
```

### 4. Create Schedule with Route

```php
use App\Models\TransportationRoute;
use App\Models\TransportationSchedule;

// Create route
$route = TransportationRoute::create([
    'from_location' => 'Phnom Penh',
    'to_location' => 'Siem Reap',
    'distance_km' => 314.5,
    'duration_hours' => 6.5,
]);

// Create schedule
$schedule = TransportationSchedule::create([
    'bus_id' => $bus->id,
    'route_id' => $route->id,
    'departure_time' => '2025-11-15 08:00:00',
    'arrival_time' => '2025-11-15 14:30:00',
    'price' => 15.00,
    'available_seats' => $bus->seat_capacity,
    'status' => 'scheduled',
]);
```

---

## 📊 Key Features

### Owner Assignment (Same as Property Model)

✅ Each bus is assigned to an owner via `owner_user_id`  
✅ Foreign key constraint ensures owner exists  
✅ Cascade delete when owner is deleted  
✅ Owner can access all their buses via `ownedTransportations`

### Automatic Relationships

✅ Transportation → Owner (BelongsTo)  
✅ Transportation → Seats (HasMany)  
✅ Transportation → Schedules (HasMany)  
✅ Schedule → Bus (BelongsTo)  
✅ Schedule → Route (BelongsTo)

### Data Integrity

✅ Unique seat numbers per bus  
✅ Prevent double-booking same seat  
✅ Cascade deletes for related records  
✅ Proper foreign key constraints

---

## 🔄 Comparison with Property Model

| Feature           | Property (Hotels)   | Transportation (Buses)   |
| ----------------- | ------------------- | ------------------------ |
| Owner Assignment  | ✅ `owner_user_id`  | ✅ `owner_user_id`       |
| Primary Resource  | Place (Hotel)       | Bus                      |
| Sub-resources     | Rooms               | Seats                    |
| Bookable Items    | Room Properties     | Schedules                |
| Booking Details   | Room Amenities      | Routes                   |
| Cascade Delete    | ✅ Yes              | ✅ Yes                   |
| User Relationship | `ownedProperties()` | `ownedTransportations()` |

---

## 📝 Next Steps

1. ✅ Models created
2. ✅ Migrations created
3. ✅ User relationship added
4. ⏳ Run migrations
5. ⏳ Create TransportationController (similar to HotelController)
6. ⏳ Add routes to web.php
7. ⏳ Create permissions (view buses, create buses, etc.)
8. ⏳ Test creating transportation with owner assignment

---

## 💡 Usage Examples

### Query with Relationships

```php
// Get bus with owner and schedules
$bus = Transportation::with(['owner', 'schedules.route'])->find($id);

// Get owner's name
echo $bus->owner->name;

// Count active schedules
$activeCount = $bus->activeSchedules()->count();

// Get buses with at least one schedule
$activeBuses = Transportation::has('schedules')->get();
```

### Filtering by Owner

```php
// Get all buses owned by a specific user
$userBuses = Transportation::where('owner_user_id', $userId)->get();

// Or from user model
$userBuses = $user->ownedTransportations;
```

### Creating with Seats

```php
DB::transaction(function () use ($data) {
    $bus = Transportation::create($data);

    // Generate seats
    for ($i = 1; $i <= $bus->seat_capacity; $i++) {
        $bus->seats()->create([
            'seat_number' => 'A' . $i,
        ]);
    }

    return $bus;
});
```

---

**Status:** ✅ All models and migrations created successfully!  
**Pattern:** Follows the same structure as Hotel Property model  
**Ready for:** Controller implementation and testing
