# 🚀 Quick Implementation Guide: Bus Transportation Dashboard

## ✅ Completed (Frontend)

✓ **index.tsx** - Bus listing page with search, filters, and pagination  
✓ **createEdit.tsx** - Add/Edit bus form with validation  
✓ **show.tsx** - Detailed bus view with schedules and stats

All files are located in: `/backend/resources/js/pages/buses/`

---

## 🔨 TODO: Backend Implementation

### Step 1: Create Models (Priority: HIGH)

Create these files in `/backend/app/Models/Bus/`:

1. **Bus.php**

    - Relationships: owner, seats, schedules
    - Auto-generate seat layout on creation

2. **BusSeat.php**

    - Belongs to bus
    - Unique seat numbers per bus

3. **Route.php**

    - Has many schedules
    - Store from/to locations

4. **BusSchedule.php**
    - Belongs to bus and route
    - Track status and availability

### Step 2: Create Controller

File: `/backend/app/Http/Controllers/BusController.php`

**Required Methods:**

```php
index()    // List all buses with filters
create()   // Show create form
store()    // Save new bus + auto-generate seats
show()     // Display bus details with schedules
edit()     // Show edit form
update()   // Update bus info
destroy()  // Delete bus and related data
```

### Step 3: Add Routes

In `/backend/routes/web.php`, add:

```php
Route::prefix('buses')->name('buses.')->group(function () {
    Route::get('/', [BusController::class, 'index'])
        ->middleware('permission:view buses')->name('index');
    Route::get('/create', [BusController::class, 'create'])
        ->middleware('permission:create buses')->name('create');
    Route::post('/', [BusController::class, 'store'])
        ->middleware('permission:create buses')->name('store');
    Route::get('/{id}', [BusController::class, 'show'])
        ->middleware('permission:view buses')->name('show');
    Route::get('/{id}/edit', [BusController::class, 'edit'])
        ->middleware('permission:edit buses')->name('edit');
    Route::put('/{id}', [BusController::class, 'update'])
        ->middleware('permission:edit buses')->name('update');
    Route::delete('/{id}', [BusController::class, 'destroy'])
        ->middleware('permission:delete buses')->name('destroy');
});
```

### Step 4: Database Setup

Run migrations (if not already done):

-   `buses` table
-   `bus_seats` table
-   `routes` table
-   `bus_schedules` table
-   `booking_bus_seats` table

Add foreign key for owner:

```php
$table->foreignId('owner_user_id')
    ->constrained('users')
    ->onDelete('cascade');
```

### Step 5: Permissions & Roles

Add to your permission seeder:

```php
$permissions = [
    'view buses',
    'create buses',
    'edit buses',
    'delete buses',
];

// Assign to admin role
$adminRole->givePermissionTo($permissions);

// Create bus owner role
$busOwnerRole = Role::create(['name' => 'bus owner']);
```

### Step 6: Navigation

Add to admin sidebar navigation:

```tsx
{
    title: "Transportation",
    url: "/buses",
    icon: Bus, // Import from lucide-react
    permission: "view buses",
}
```

---

## 📦 Sample Controller Implementation

```php
<?php

namespace App\Http\Controllers;

use App\Models\Bus\Bus;
use App\Models\Bus\BusSeat;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BusController extends Controller
{
    public function index(Request $request)
    {
        $query = Bus::with(['owner:id,name,email'])
            ->withCount([
                'schedules as active_schedules_count' => function ($q) {
                    $q->where('status', 'scheduled');
                },
                'schedules as total_schedules_count'
            ]);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('bus_name', 'like', "%{$search}%")
                  ->orWhere('bus_plate', 'like', "%{$search}%")
                  ->orWhereHas('owner', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->has('schedules');
            } elseif ($request->status === 'inactive') {
                $query->doesntHave('schedules');
            }
        }

        $buses = $query->orderBy('created_at', 'desc')
                      ->paginate(10)
                      ->withQueryString();

        return Inertia::render('buses/index', [
            'buses' => $buses,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $owners = User::role('bus owner')
                     ->whereDoesntHave('ownedBuses')
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        return Inertia::render('buses/createEdit', [
            'owners' => $owners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bus_name' => 'nullable|string|max:255',
            'bus_plate' => 'nullable|string|max:50',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'owner_user_id' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $bus = Bus::create($validated);

            // Auto-generate seats
            for ($i = 1; $i <= $bus->seat_capacity; $i++) {
                BusSeat::create([
                    'bus_id' => $bus->id,
                    'seat_number' => 'A' . $i, // Simple naming: A1, A2, etc.
                ]);
            }

            DB::commit();
            return redirect()->route('buses.index')
                ->with('success', 'Bus created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create bus.']);
        }
    }

    public function show($id)
    {
        $bus = Bus::with([
            'owner:id,name,email,phone_number',
            'schedules.route',
        ])->findOrFail($id);

        $bookingStats = [
            'total_bookings' => 0, // TODO: Implement when booking system is ready
            'confirmed_bookings' => 0,
            'pending_bookings' => 0,
            'total_revenue' => 0,
        ];

        return Inertia::render('buses/show', [
            'bus' => $bus,
            'bookingStats' => $bookingStats,
        ]);
    }

    public function edit($id)
    {
        $bus = Bus::with('owner')->findOrFail($id);

        $owners = User::role('bus owner')
                     ->orderBy('name')
                     ->get(['id', 'name', 'email']);

        return Inertia::render('buses/createEdit', [
            'bus' => $bus,
            'owners' => $owners,
        ]);
    }

    public function update(Request $request, $id)
    {
        $bus = Bus::findOrFail($id);

        $validated = $request->validate([
            'bus_name' => 'nullable|string|max:255',
            'bus_plate' => 'nullable|string|max:50',
            'seat_capacity' => 'required|integer|min:1|max:100',
            'owner_user_id' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            // If capacity changed, regenerate seats
            if ($bus->seat_capacity != $validated['seat_capacity']) {
                $bus->seats()->delete();
                for ($i = 1; $i <= $validated['seat_capacity']; $i++) {
                    BusSeat::create([
                        'bus_id' => $bus->id,
                        'seat_number' => 'A' . $i,
                    ]);
                }
            }

            $bus->update($validated);

            DB::commit();
            return redirect()->route('buses.show', $bus->id)
                ->with('success', 'Bus updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update bus.']);
        }
    }

    public function destroy($id)
    {
        $bus = Bus::findOrFail($id);
        $bus->delete(); // Cascade deletes seats and schedules

        return redirect()->route('buses.index')
            ->with('success', 'Bus deleted successfully!');
    }
}
```

---

## 🧪 Testing Checklist

-   [ ] Create a new bus operator
-   [ ] Assign bus to an owner
-   [ ] View bus details page
-   [ ] Edit bus information
-   [ ] Change seat capacity (should regenerate seats)
-   [ ] Search by bus name
-   [ ] Filter by status
-   [ ] Delete a bus
-   [ ] Check permissions work correctly
-   [ ] Test responsive design on mobile

---

## 📖 Reference Documents

-   **Full Design Doc**: `/backend/docs/TRANSPORTATION_DASHBOARD_DESIGN.md`
-   **Database Schema**: `/backend/docs/bus_database_design.md`
-   **Hotel Implementation**: `/backend/app/Http/Controllers/HotelController.php` (for reference)

---

## 💡 Tips

1. **Use Hotel as Template**: The bus system follows the same pattern as hotels
2. **Start with Models**: Get the database relationships right first
3. **Test Each Step**: Don't move forward until each feature works
4. **Permission Names**: Keep them consistent (`view buses`, `create buses`, etc.)
5. **Validation**: Add proper validation rules in the controller

---

**Status**: Frontend ✅ Complete | Backend ⏳ Pending Implementation
