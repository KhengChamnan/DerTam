# Bus Owner Assignment - Quick Setup

## ✅ Changes Made

### 1. Updated Bus Model

**File:** `/backend/app/Models/Bus/Bus.php`

**Added:**

-   `owner_user_id` to fillable fields
-   `owner()` relationship method (BelongsTo User)
-   `activeSchedules()` helper method for filtering

**Usage:**

```php
// Access bus owner
$bus = Bus::with('owner')->find($id);
echo $bus->owner->name;

// Create bus with owner
$bus = Bus::create([
    'bus_name' => 'Express 01',
    'bus_plate' => '1A-2345',
    'seat_capacity' => 40,
    'owner_user_id' => $userId,
]);
```

---

### 2. Updated User Model

**File:** `/backend/app/Models/User.php`

**Added:**

-   `ownedBuses()` relationship method

**Usage:**

```php
// Get all buses owned by a user
$userBuses = $user->ownedBuses;

// Query buses by owner
$buses = Bus::where('owner_user_id', $userId)->get();
```

---

### 3. Created Migration

**File:** `/backend/database/migrations/2025_11_10_100000_add_owner_to_buses_table.php`

**Adds:**

-   `owner_user_id` column to `buses` table
-   Foreign key constraint to `users` table
-   Cascade delete when user is deleted
-   Column is nullable for backward compatibility

**Run Migration:**

```bash
php artisan migrate
```

---

## 🔧 Next Steps

### 1. Run the Migration

```bash
cd /Users/chaosunly/Developer/TERM1Y4/Capstone_II/DerTam_APP/G9_Capstone_Project_ll/backend
php artisan migrate
```

### 2. Update Existing Frontend References

The frontend files in `/backend/resources/js/pages/buses/` are ready to use with these data structures:

**Expected Data Structure (index.tsx):**

```typescript
interface BusOperator {
    id: number; // Use 'id' not 'bus_id'
    bus_name: string;
    bus_plate: string;
    seat_capacity: number;
    owner: {
        id: number;
        name: string;
        email: string;
    };
    active_schedules_count: number;
    total_schedules_count: number;
    created_at: string;
}
```

### 3. Create BusController

Follow the sample implementation in `/backend/docs/BUS_DASHBOARD_IMPLEMENTATION_GUIDE.md`

**Key methods:**

-   `index()` - List buses with owner relationship
-   `create()` - Show form with available owners
-   `store()` - Create bus with owner assignment
-   `show()` - Display bus details with schedules
-   `edit()` - Update bus info
-   `destroy()` - Delete bus

**Example Query:**

```php
// In BusController@index
$buses = Bus::with(['owner:id,name,email'])
    ->withCount([
        'schedules as active_schedules_count' => function ($q) {
            $q->where('status', 'scheduled');
        },
        'schedules as total_schedules_count'
    ])
    ->paginate(10);
```

---

## 📋 Model Relationships Overview

```
User (owner)
  └─ hasMany → Bus (owner_user_id)
      ├─ hasMany → BusSeat (bus_id)
      └─ hasMany → BusSchedule (bus_id)
          ├─ belongsTo → Route (route_id)
          └─ hasMany → SeatBooking (schedule_id)
              └─ belongsTo → BusSeat (seat_id)
```

---

## 🎯 Available Relationships

```php
// From Bus
$bus->owner;              // Get owner (User)
$bus->seats;              // Get all seats
$bus->schedules;          // Get all schedules
$bus->activeSchedules;    // Get scheduled trips only

// From User
$user->ownedBuses;        // Get all owned buses
$user->ownedProperties;   // Get all owned hotels (existing)

// From BusSchedule (existing)
$schedule->bus;           // Get the bus
$schedule->route;         // Get the route
$schedule->bookings;      // Get seat bookings
```

---

## 🔐 Permissions Needed

Create these permissions in your seeder:

```php
$permissions = [
    'view buses',
    'create buses',
    'edit buses',
    'delete buses',
];

// Assign to admin
$adminRole->givePermissionTo($permissions);

// Create bus owner role
$busOwnerRole = Role::firstOrCreate(['name' => 'bus owner']);
$busOwnerRole->givePermissionTo(['view buses']);
```

---

## ⚡ Quick Test

After running migration:

```php
use App\Models\Bus\Bus;
use App\Models\User;

// Test creating bus with owner
$owner = User::first();
$bus = Bus::create([
    'bus_name' => 'Test Bus',
    'seat_capacity' => 30,
    'owner_user_id' => $owner->id,
]);

// Test relationships
dump($bus->owner->name);        // Should show owner name
dump($owner->ownedBuses->count()); // Should show 1
```

---

## 📁 Files Modified

✅ `/backend/app/Models/Bus/Bus.php` - Added owner relationship  
✅ `/backend/app/Models/User.php` - Added ownedBuses relationship  
✅ Created migration: `2025_11_10_100000_add_owner_to_buses_table.php`  
✅ Removed duplicate Transportation models  
✅ Frontend files ready in `/backend/resources/js/pages/buses/`

---

## 🚀 Ready to Use!

Your existing Bus models are now enhanced with owner assignment, matching the Property model pattern. Just run the migration and create the controller!
