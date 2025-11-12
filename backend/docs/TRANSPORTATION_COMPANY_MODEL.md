# Transportation Company Model - Proper Structure

## 🏗️ Correct Architecture

### Hotel System Structure:

```
User (Owner)
  └─ Property (Hotel Building)
      └─ RoomProperty (Room Types)
          └─ Room (Individual Rooms)
```

### Transportation System Structure:

```
User (Owner)
  └─ TransportationCompany (Bus Company/Organization)
      └─ Bus (Individual Buses - like rooms)
          ├─ BusSeat (Seats in bus)
          └─ BusSchedule (Trips/Routes)
              └─ SeatBooking (Bookings)
```

---

## ✅ Models Created

### 1. TransportationCompany Model

**File:** `/backend/app/Models/TransportationCompany.php`

**Purpose:** Represents a bus company/organization (like Property for hotels)

**Table:** `transportations`

**Relationships:**

-   `owner()` - BelongsTo User (company owner)
-   `buses()` - HasMany Bus (all buses owned by this company)
-   `activeBuses()` - HasMany Bus (only buses with scheduled trips)

**Fillable Fields:**

-   `company_name` (required) - Name of bus company
-   `company_description` (optional) - About the company
-   `company_logo` (optional) - Logo image path
-   `contact_phone` (optional) - Company phone
-   `contact_email` (optional) - Company email
-   `owner_user_id` (required) - Foreign key to users table

**Usage:**

```php
// Create transportation company
$company = TransportationCompany::create([
    'company_name' => 'Giant Ibis Transport',
    'company_description' => 'Premium bus service in Cambodia',
    'contact_email' => 'info@giantibis.com',
    'owner_user_id' => $userId,
]);

// Access owner
$owner = $company->owner;

// Get all company buses
$buses = $company->buses;

// Get only active buses
$activeBuses = $company->activeBuses;
```

---

### 2. Updated Bus Model

**File:** `/backend/app/Models/Bus/Bus.php`

**Changes:**

-   Removed `owner_user_id`
-   Added `transportation_id` (belongs to company, not directly to user)
-   Changed relationship from `owner()` to `transportation()`

**Usage:**

```php
// Create bus under a company
$bus = Bus::create([
    'bus_name' => 'Express 01',
    'seat_capacity' => 40,
    'transportation_id' => $companyId,
]);

// Access the company
$company = $bus->transportation;

// Access the company owner
$owner = $bus->transportation->owner;
```

---

### 3. Updated User Model

**File:** `/backend/app/Models/User.php`

**Added Relationship:**

```php
public function ownedTransportations()
{
    return $this->hasMany(TransportationCompany::class, 'owner_user_id', 'id');
}
```

**Usage:**

```php
// Get all transportation companies owned by user
$userCompanies = $user->ownedTransportations;

// Get all buses across all companies
$allUserBuses = $user->ownedTransportations()
    ->with('buses')
    ->get()
    ->pluck('buses')
    ->flatten();
```

---

## 📊 Database Structure

### New Table: `transportations`

```sql
CREATE TABLE transportations (
    id BIGINT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT NULL,
    company_logo VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    contact_email VARCHAR(255) NULL,
    owner_user_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Modified Table: `buses`

```sql
ALTER TABLE buses ADD COLUMN transportation_id BIGINT NULL;
ALTER TABLE buses ADD CONSTRAINT fk_buses_transportation
    FOREIGN KEY (transportation_id) REFERENCES transportations(id) ON DELETE CASCADE;
```

---

## 🔄 Complete Relationship Chain

```
User (Transportation Owner)
  ↓
TransportationCompany (Bus Company)
  ↓
Bus (Individual Bus - like a room in hotel)
  ↓
├─ BusSeat (Seats)
└─ BusSchedule (Trips)
    ↓
    ├─ Route (From/To locations)
    └─ SeatBooking (Individual bookings)
```

**Example Query:**

```php
// Get all schedules for a specific owner
$schedules = BusSchedule::whereHas('bus.transportation', function ($q) use ($userId) {
    $q->where('owner_user_id', $userId);
})->get();

// Get company with all buses and their schedules
$company = TransportationCompany::with(['buses.schedules.route'])
    ->find($companyId);
```

---

## 🎯 Admin Dashboard Flow

### Creating Transportation Company (Similar to Creating Hotel Property)

**Step 1: Admin creates transportation company**

-   Company name, description, contact info
-   Assign to owner (transportation owner user)

**Step 2: Owner manages their company's buses**

-   Add individual buses (like adding rooms to hotel)
-   Set bus capacity, plate number
-   Create schedules for each bus

**Step 3: Schedules and bookings**

-   Bus schedules link to routes
-   Users book seats on specific schedules

---

## 🔧 Frontend Data Structure

Update your frontend interfaces:

### Transportation Index Page

```typescript
interface TransportationCompany {
    id: number;
    company_name: string;
    company_description: string;
    company_logo: string;
    contact_phone: string;
    contact_email: string;
    owner: {
        id: number;
        name: string;
        email: string;
    };
    buses_count: number;
    active_buses_count: number;
    total_schedules_count: number;
    created_at: string;
}
```

### Transportation Show Page

```typescript
interface TransportationDetail {
    id: number;
    company_name: string;
    company_description: string;
    owner: Owner;
    buses: Bus[];
    stats: {
        total_buses: number;
        active_buses: number;
        total_schedules: number;
        total_bookings: number;
    };
}
```

---

## 📝 Migration Steps

**1. Run the migration:**

```bash
php artisan migrate
```

This will:

-   Create `transportations` table
-   Add `transportation_id` column to `buses` table

**2. Update existing buses (if any):**

```php
// If you have existing buses, you need to assign them to companies first
// Create a default company for existing buses
$defaultCompany = TransportationCompany::create([
    'company_name' => 'Default Transport Company',
    'owner_user_id' => 1, // Admin user ID
]);

// Assign all existing buses to this company
Bus::whereNull('transportation_id')->update([
    'transportation_id' => $defaultCompany->id
]);
```

---

## 🚀 Controller Implementation

### TransportationController (Similar to HotelController)

```php
class TransportationController extends Controller
{
    public function index(Request $request)
    {
        $companies = TransportationCompany::with(['owner'])
            ->withCount(['buses', 'activeBuses', 'schedules'])
            ->paginate(10);

        return Inertia::render('transportations/index', [
            'companies' => $companies,
        ]);
    }

    public function create()
    {
        // Get users with 'transportation owner' role
        $owners = User::role('transportation owner')
            ->whereDoesntHave('ownedTransportations')
            ->get();

        return Inertia::render('transportations/createEdit', [
            'owners' => $owners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_description' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'owner_user_id' => 'required|exists:users,id',
        ]);

        $company = TransportationCompany::create($validated);

        return redirect()->route('transportations.show', $company);
    }

    public function show($id)
    {
        $company = TransportationCompany::with([
            'owner',
            'buses.schedules.route'
        ])->findOrFail($id);

        return Inertia::render('transportations/show', [
            'company' => $company,
        ]);
    }
}
```

---

## 🎨 UI Pages Needed

### 1. Transportation Companies List (`/transportations`)

-   List all transportation companies
-   Show owner, number of buses, active schedules
-   Actions: View, Edit, Delete

### 2. Transportation Company Details (`/transportations/{id}`)

-   Company information
-   List of all buses in the company
-   Owner contact details
-   Statistics

### 3. Transportation Company Create/Edit (`/transportations/create`)

-   Company name and details
-   Owner selection (from transportation owners)
-   Contact information

### 4. Bus Management (Owner's view)

-   Owners can add/edit/delete buses in their company
-   Set schedules for each bus
-   View bookings

---

## 🔐 Permissions

```php
// Transportation company management (Admin)
'view transportations',
'create transportations',
'edit transportations',
'delete transportations',

// Bus management (Owner)
'manage own buses',
'create schedules',
'view bookings',

// Create roles
$transportationOwnerRole = Role::create(['name' => 'transportation owner']);
$transportationOwnerRole->givePermissionTo([
    'view transportations',
    'manage own buses',
    'create schedules',
    'view bookings',
]);
```

---

## 📋 Comparison with Hotel System

| Hotel System   | Transportation System  |
| -------------- | ---------------------- |
| Property       | TransportationCompany  |
| Property Owner | Transportation Owner   |
| Rooms          | Buses                  |
| Room Types     | (Not needed for buses) |
| Room Amenities | (Not needed for buses) |
| Facilities     | (Not needed for buses) |
| Bookings       | Seat Bookings          |

---

## ✅ Summary

**Correct Flow:**

1. Admin creates **Transportation Company** (like Property)
2. Admin assigns company to **Owner** (user with transportation owner role)
3. Owner manages their company's **Buses** (like rooms)
4. Owner creates **Schedules** for each bus
5. Users book **Seats** on specific schedules

**Key Point:** Buses belong to companies, companies belong to users. NOT buses directly to users!

---

**Migration File:** `/backend/database/migrations/2025_11_10_100000_create_transportations_table.php`  
**Run:** `php artisan migrate`
