# SQL Query Documentation - Trip Management System

This document explains all SQL queries used in the Trip Management API controllers, their purpose, and how they interact with the database.

---

## Table of Contents
1. [TripController Queries](#tripcontroller-queries)
2. [TripPlaceSelectionController Queries](#tripplaceselectioncontroller-queries)
3. [Database Schema Overview]****(#database-schema-overview)
4. [Query Performance Notes](#query-performance-notes)

---

## TripController Queries

### 1. Create Trip - `store()` Method

#### Query 1: Insert New Trip
```sql
INSERT INTO trips (user_id, trip_name, start_date, end_date, created_at, updated_at)
VALUES (?, ?, ?, ?, NOW(), NOW())
```

**Purpose:** Creates a new trip record in the database.

**Parameters:**
- `user_id` - Authenticated user's ID (from `auth()->id()`)
- `trip_name` - User-provided trip name
- `start_date` - Trip start date (YYYY-MM-DD)
- `end_date` - Trip end date (YYYY-MM-DD)

**Laravel Code:**
```php
$tripId = DB::table('trips')->insertGetId([
    'user_id' => $userId,
    'trip_name' => $request->trip_name,
    'start_date' => $request->start_date,
    'end_date' => $request->end_date,
    'created_at' => now(),
    'updated_at' => now(),
]);
```

**Returns:** The newly created `trip_id`

---

#### Query 2: Bulk Insert Trip Days
```sql
INSERT INTO trip_days (trip_id, date, day_number, created_at, updated_at)
VALUES 
    (?, '2025-10-20', 1, NOW(), NOW()),
    (?, '2025-10-21', 2, NOW(), NOW()),
    (?, '2025-10-22', 3, NOW(), NOW())
    -- ... one row for each day
```

**Purpose:** Creates individual day records for each date in the trip range.

**Logic:**
- Calculates all dates between `start_date` and `end_date` using Carbon
- Generates a `day_number` (1, 2, 3, etc.) for each date
- Inserts all days in a single batch operation

**Laravel Code:**
```php
while ($currentDate->lte($endDate)) {
    $tripDays[] = [
        'trip_id' => $tripId,
        'date' => $currentDate->format('Y-m-d'),
        'day_number' => $dayNumber,
        'created_at' => now(),
        'updated_at' => now(),
    ];
    $currentDate->addDay();
    $dayNumber++;
}
DB::table('trip_days')->insert($tripDays);
```

**Example:** 
- Start: 2025-10-20, End: 2025-10-22
- Creates 3 records: Day 1, Day 2, Day 3

---

#### Query 3: Fetch Created Trip
```sql
SELECT * FROM trips
WHERE trip_id = ?
LIMIT 1
```

**Purpose:** Retrieves the newly created trip details to return in response.

**Laravel Code:**
```php
$trip = DB::table('trips')
    ->where('trip_id', $tripId)
    ->first();
```

---

#### Query 4: Fetch Trip Days
```sql
SELECT * FROM trip_days
WHERE trip_id = ?
ORDER BY date ASC
```

**Purpose:** Retrieves all generated trip days in chronological order.

**Laravel Code:**
```php
$days = DB::table('trip_days')
    ->where('trip_id', $tripId)
    ->orderBy('date', 'asc')
    ->get();
```

---

### 2. Get All Trips - `index()` Method

#### Query 1: Get User's Trips
```sql
SELECT * FROM trips
WHERE user_id = ?
ORDER BY created_at DESC
```

**Purpose:** Retrieves all trips for the authenticated user, newest first.

**Laravel Code:**
```php
$trips = DB::table('trips')
    ->where('user_id', $userId)
    ->orderBy('created_at', 'desc')
    ->get();
```

---

#### Query 2: Count Days per Trip (Loop)
```sql
SELECT COUNT(*) as aggregate FROM trip_days
WHERE trip_id = ?
```

**Purpose:** For each trip, counts how many days it contains.

**Laravel Code:**
```php
foreach ($trips as $trip) {
    $trip->days_count = DB::table('trip_days')
        ->where('trip_id', $trip->trip_id)
        ->count();
}
```

**Note:** This creates N+1 queries. For better performance with many trips, consider using a single JOIN query:

**Optimized Alternative:**
```sql
SELECT trips.*, COUNT(trip_days.trip_day_id) as days_count
FROM trips
LEFT JOIN trip_days ON trips.trip_id = trip_days.trip_id
WHERE trips.user_id = ?
GROUP BY trips.trip_id
ORDER BY trips.created_at DESC
```

---

### 3. Get Specific Trip - `show()` Method

#### Query 1: Get Trip Details with Authorization Check
```sql
SELECT * FROM trips
WHERE trip_id = ? AND user_id = ?
LIMIT 1
```

**Purpose:** Fetches a specific trip, ensuring it belongs to the authenticated user.

**Security:** The `user_id` check prevents unauthorized access to other users' trips.

**Laravel Code:**
```php
$trip = DB::table('trips')
    ->where('trip_id', $tripId)
    ->where('user_id', $userId)
    ->first();
```

---

#### Query 2: Get All Trip Days
```sql
SELECT * FROM trip_days
WHERE trip_id = ?
ORDER BY date ASC
```

**Purpose:** Retrieves all days for the trip in chronological order.

**Laravel Code:**
```php
$days = DB::table('trip_days')
    ->where('trip_id', $tripId)
    ->orderBy('date', 'asc')
    ->get();
```

---

### 4. Get Trip Day Places - `getTripDayPlaces()` Method

#### Query 1: Verify Trip Day Ownership
```sql
SELECT trip_days.*, trips.trip_name
FROM trip_days
INNER JOIN trips ON trip_days.trip_id = trips.trip_id
WHERE trip_days.trip_day_id = ?
  AND trips.user_id = ?
LIMIT 1
```

**Purpose:** 
- Verifies the trip day exists
- Ensures it belongs to the authenticated user via the trip
- Fetches trip name for display

**Security:** Critical authorization check to prevent accessing other users' trip days.

**Laravel Code:**
```php
$tripDay = DB::table('trip_days')
    ->join('trips', 'trip_days.trip_id', '=', 'trips.trip_id')
    ->where('trip_days.trip_day_id', $tripDayId)
    ->where('trips.user_id', $userId)
    ->select('trip_days.*', 'trips.trip_name')
    ->first();
```

---

#### Query 2: Get All Places for Trip Day
```sql
SELECT 
    trip_places.trip_place_id,
    trip_places.trip_day_id,
    trip_places.place_id,
    trip_places.notes,
    trip_places.created_at as added_at,
    places.name as place_name,
    places.description as place_description,
    places.category_id,
    place_categories.category_name,
    places.google_maps_link,
    places.ratings,
    places.reviews_count,
    places.images_url,
    places.entry_free,
    places.operating_hours,
    places.province_id,
    province_categories.province_categoryName,
    places.latitude,
    places.longitude
FROM trip_places
INNER JOIN places ON trip_places.place_id = places.placeID
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE trip_places.trip_day_id = ?
ORDER BY trip_places.created_at ASC
```

**Purpose:** Retrieves complete information about all places added to this trip day.

**Joins Explained:**
- **INNER JOIN places:** Links trip_places to actual place details (required)
- **LEFT JOIN place_categories:** Gets category name (optional - place might not have category)
- **LEFT JOIN province_categories:** Gets province name (optional - place might not have province)

**Order:** Places appear in the order they were added to the trip day.

**Laravel Code:**
```php
$places = DB::table('trip_places')
    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
    ->where('trip_places.trip_day_id', $tripDayId)
    ->select(/* all fields listed above */)
    ->orderBy('trip_places.created_at', 'asc')
    ->get();
```

---

### 5. Add Places to Trip Day - `addPlacesToDay()` Method

#### Query 1: Verify Trip Day Ownership
```sql
SELECT trip_days.*
FROM trip_days
INNER JOIN trips ON trip_days.trip_id = trips.trip_id
WHERE trip_days.trip_day_id = ?
  AND trips.user_id = ?
LIMIT 1
```

**Purpose:** Authorization check before allowing places to be added.

**Laravel Code:**
```php
$tripDay = DB::table('trip_days')
    ->join('trips', 'trip_days.trip_id', '=', 'trips.trip_id')
    ->where('trip_days.trip_day_id', $tripDayId)
    ->where('trips.user_id', $userId)
    ->select('trip_days.*')
    ->first();
```

---

#### Query 2: Bulk Insert Trip Places
```sql
INSERT INTO trip_places (trip_day_id, place_id, notes, created_at, updated_at)
VALUES 
    (?, 1, 'Visit in morning', NOW(), NOW()),
    (?, 2, 'Great for lunch', NOW(), NOW()),
    (?, 3, 'Evening activity', NOW(), NOW())
```

**Purpose:** Adds multiple places to the trip day in one operation.

**Parameters:**
- `trip_day_id` - The day to add places to
- `place_id` - ID of the place being added
- `notes` - Optional user notes for this place in their trip

**Laravel Code:**
```php
foreach ($request->place_ids as $index => $placeId) {
    $tripPlaces[] = [
        'trip_day_id' => $tripDayId,
        'place_id' => $placeId,
        'notes' => $notes[$index] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}
DB::table('trip_places')->insert($tripPlaces);
```

---

#### Query 3: Fetch Added Places
```sql
SELECT 
    trip_places.trip_place_id,
    trip_places.trip_day_id,
    trip_places.place_id,
    trip_places.notes,
    places.name as place_name,
    places.description as place_description,
    places.google_maps_link,
    places.ratings,
    places.images_url,
    trip_places.created_at
FROM trip_places
INNER JOIN places ON trip_places.place_id = places.placeID
WHERE trip_places.trip_day_id = ?
ORDER BY trip_places.created_at DESC
LIMIT ?
```

**Purpose:** Returns the places that were just added for confirmation.

**LIMIT:** Set to the count of places just added to get only the new ones.

**ORDER:** DESC to get the most recently added first.

**Laravel Code:**
```php
$addedPlaces = DB::table('trip_places')
    ->join('places', 'trip_places.place_id', '=', 'places.placeID')
    ->where('trip_places.trip_day_id', $tripDayId)
    ->select(/* fields listed above */)
    ->orderBy('trip_places.created_at', 'desc')
    ->limit(count($request->place_ids))
    ->get();
```

---

## TripPlaceSelectionController Queries

### 1. Get All Places - `index()` Method

#### Main Query with Filters
```sql
SELECT 
    places.placeID,
    places.name,
    places.description,
    places.category_id,
    place_categories.category_name,
    places.google_maps_link,
    places.ratings,
    places.reviews_count,
    places.images_url,
    places.entry_free,
    places.province_id,
    province_categories.province_categoryName,
    places.latitude,
    places.longitude
FROM places
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE 1=1
  [AND places.category_id = ?]           -- Optional: if category_id provided
  [AND places.province_id = ?]           -- Optional: if province_id provided
  [AND (places.name LIKE ? OR places.description LIKE ?)]  -- Optional: if search provided
  [AND places.ratings >= ?]              -- Optional: if min_rating provided
  [AND places.entry_free = ?]            -- Optional: if entry_free provided
ORDER BY places.ratings DESC, places.name ASC
LIMIT ? OFFSET ?
```

**Purpose:** Flexible query to retrieve places with multiple optional filters.

**Joins:**
- **LEFT JOIN** used because not all places have categories or provinces

**Filters (All Optional):**
1. **category_id:** Filter by place type (restaurants, attractions, etc.)
2. **province_id:** Filter by location
3. **search:** Search in place name or description (uses LIKE with wildcards)
4. **min_rating:** Only show highly-rated places
5. **entry_free:** Filter free vs paid entry

**Sorting:**
- Primary: By rating (highest first)
- Secondary: By name (alphabetically)

**Pagination:**
- `LIMIT`: Number of results per page (default: 20)
- `OFFSET`: Skip records based on page number

**Laravel Code:**
```php
$query = DB::table('places')
    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
    ->select(/* fields above */);

// Add filters conditionally
if ($request->has('category_id')) {
    $query->where('places.category_id', $request->category_id);
}

if ($request->has('search')) {
    $searchTerm = $request->search;
    $query->where(function($q) use ($searchTerm) {
        $q->where('places.name', 'LIKE', "%{$searchTerm}%")
          ->orWhere('places.description', 'LIKE', "%{$searchTerm}%");
    });
}

// Pagination
$places = $query
    ->orderBy('places.ratings', 'desc')
    ->orderBy('places.name', 'asc')
    ->offset(($page - 1) * $perPage)
    ->limit($perPage)
    ->get();
```

---

#### Count Query
```sql
SELECT COUNT(*) as aggregate
FROM places
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE [same filters as main query]
```

**Purpose:** Gets total count of matching places for pagination metadata.

**Note:** Uses the same filters as the main query to ensure accurate count.

**Laravel Code:**
```php
$total = $query->count();
```

---

### 2. Get Place Details - `show()` Method

```sql
SELECT 
    places.*,
    place_categories.category_name,
    place_categories.category_description,
    province_categories.province_categoryName
FROM places
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE places.placeID = ?
LIMIT 1
```

**Purpose:** Retrieves complete details about a specific place.

**Returns:** All place fields plus category and province names.

**Laravel Code:**
```php
$place = DB::table('places')
    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
    ->where('places.placeID', $placeId)
    ->select('places.*', 'place_categories.category_name', 
             'place_categories.category_description', 
             'province_categories.province_categoryName')
    ->first();
```

---

### 3. Get Places by IDs - `getByIds()` Method

```sql
SELECT 
    places.placeID,
    places.name,
    places.description,
    places.category_id,
    place_categories.category_name,
    places.google_maps_link,
    places.ratings,
    places.reviews_count,
    places.images_url,
    places.entry_free,
    places.province_id,
    province_categories.province_categoryName,
    places.latitude,
    places.longitude
FROM places
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE places.placeID IN (?, ?, ?, ?)
```

**Purpose:** Efficiently retrieves multiple places by their IDs in one query.

**Use Case:** Batch retrieval when you have a list of specific place IDs.

**Laravel Code:**
```php
$places = DB::table('places')
    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
    ->whereIn('places.placeID', $placeIds)
    ->select(/* fields listed above */)
    ->get();
```

**Example:** `placeIds = [1, 3, 5, 7]` retrieves those 4 places in one query.

---

### 4. Get Popular Places - `popular()` Method

```sql
SELECT 
    places.placeID,
    places.name,
    places.description,
    places.category_id,
    place_categories.category_name,
    places.google_maps_link,
    places.ratings,
    places.reviews_count,
    places.images_url,
    places.entry_free,
    places.province_id,
    province_categories.province_categoryName
FROM places
LEFT JOIN place_categories ON places.category_id = place_categories.placeCategoryID
LEFT JOIN province_categories ON places.province_id = province_categories.province_categoryID
WHERE places.ratings IS NOT NULL
ORDER BY places.ratings DESC, places.reviews_count DESC
LIMIT ?
```

**Purpose:** Gets the highest-rated places for recommendations.

**Logic:**
1. Only includes places that have ratings
2. Sorts by rating (highest first)
3. Secondary sort by review count (more reviews = more reliable)
4. Limits to top N places (default: 10)

**Laravel Code:**
```php
$places = DB::table('places')
    ->leftJoin('place_categories', 'places.category_id', '=', 'place_categories.placeCategoryID')
    ->leftJoin('province_categories', 'places.province_id', '=', 'province_categories.province_categoryID')
    ->select(/* fields above */)
    ->whereNotNull('places.ratings')
    ->orderBy('places.ratings', 'desc')
    ->orderBy('places.reviews_count', 'desc')
    ->limit($limit)
    ->get();
```

---

## Database Schema Overview

### Tables Involved

#### 1. trips
| Column | Type | Description |
|--------|------|-------------|
| trip_id | BIGINT UNSIGNED (PK) | Unique trip identifier |
| user_id | BIGINT UNSIGNED (FK) | Owner of the trip |
| trip_name | VARCHAR(255) | Trip name |
| start_date | DATE | Trip start date |
| end_date | DATE | Trip end date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

---

#### 2. trip_days
| Column | Type | Description |
|--------|------|-------------|
| trip_day_id | BIGINT UNSIGNED (PK) | Unique day identifier |
| trip_id | BIGINT UNSIGNED (FK) | Parent trip |
| date | DATE | Specific date |
| day_number | INTEGER | Day sequence (1, 2, 3...) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `trip_id` → `trips.trip_id` (ON DELETE CASCADE)

---

#### 3. trip_places
| Column | Type | Description |
|--------|------|-------------|
| trip_place_id | BIGINT UNSIGNED (PK) | Unique identifier |
| trip_day_id | BIGINT UNSIGNED (FK) | Which day this place is on |
| place_id | BIGINT UNSIGNED (FK) | Which place this is |
| notes | TEXT | User notes for this place |
| created_at | TIMESTAMP | When added |
| updated_at | TIMESTAMP | Last update |

**Foreign Keys:**
- `trip_day_id` → `trip_days.trip_day_id` (ON DELETE CASCADE)
- `place_id` → `places.placeID` (ON DELETE SET NULL)

**Cascade Behavior:**
- Deleting a trip → deletes all trip_days → deletes all trip_places
- Deleting a place → sets place_id to NULL in trip_places (keeps record)

---

#### 4. places
| Column | Type | Description |
|--------|------|-------------|
| placeID | BIGINT UNSIGNED (PK) | Unique place identifier |
| name | VARCHAR(255) | Place name |
| description | TEXT | Place description |
| category_id | BIGINT UNSIGNED (FK) | Category reference |
| province_id | BIGINT UNSIGNED (FK) | Province reference |
| google_maps_link | VARCHAR(500) | Maps URL |
| ratings | DECIMAL(3,2) | Average rating (0-5) |
| reviews_count | INTEGER | Number of reviews |
| images_url | JSON | Array of image URLs |
| entry_free | BOOLEAN | Free entry flag |
| operating_hours | JSON | Opening hours |
| latitude | DECIMAL(10,7) | GPS latitude |
| longitude | DECIMAL(10,7) | GPS longitude |

---

#### 5. place_categories
| Column | Type | Description |
|--------|------|-------------|
| placeCategoryID | BIGINT UNSIGNED (PK) | Category ID |
| category_name | VARCHAR(255) | Category name |
| category_description | TEXT | Description |

---

#### 6. province_categories
| Column | Type | Description |
|--------|------|-------------|
| province_categoryID | BIGINT UNSIGNED (PK) | Province ID |
| province_categoryName | VARCHAR(255) | Province name |
| category_description | TEXT | Description |

---

## Query Performance Notes

### Indexes Recommended

For optimal performance, ensure these indexes exist:

```sql
-- Primary Keys (Auto-indexed)
ALTER TABLE trips ADD PRIMARY KEY (trip_id);
ALTER TABLE trip_days ADD PRIMARY KEY (trip_day_id);
ALTER TABLE trip_places ADD PRIMARY KEY (trip_place_id);
ALTER TABLE places ADD PRIMARY KEY (placeID);

-- Foreign Keys (Should be indexed)
ALTER TABLE trips ADD INDEX idx_user_id (user_id);
ALTER TABLE trip_days ADD INDEX idx_trip_id (trip_id);
ALTER TABLE trip_places ADD INDEX idx_trip_day_id (trip_day_id);
ALTER TABLE trip_places ADD INDEX idx_place_id (place_id);
ALTER TABLE places ADD INDEX idx_category_id (category_id);
ALTER TABLE places ADD INDEX idx_province_id (province_id);

-- Composite indexes for common queries
ALTER TABLE trips ADD INDEX idx_user_created (user_id, created_at);
ALTER TABLE places ADD INDEX idx_ratings_reviews (ratings, reviews_count);

-- Full-text search (optional, for better search performance)
ALTER TABLE places ADD FULLTEXT INDEX idx_name_description (name, description);
```

---

### Query Optimization Tips

#### 1. N+1 Query Problem (Get All Trips)
**Current Implementation:**
```php
// 1 query to get trips
$trips = DB::table('trips')->where('user_id', $userId)->get();

// N queries for days count (if user has 10 trips = 10 additional queries)
foreach ($trips as $trip) {
    $trip->days_count = DB::table('trip_days')
        ->where('trip_id', $trip->trip_id)
        ->count();
}
```

**Optimized Version:**
```php
$trips = DB::table('trips')
    ->leftJoin('trip_days', 'trips.trip_id', '=', 'trip_days.trip_id')
    ->where('trips.user_id', $userId)
    ->select('trips.*', DB::raw('COUNT(trip_days.trip_day_id) as days_count'))
    ->groupBy('trips.trip_id')
    ->orderBy('trips.created_at', 'desc')
    ->get();
```
**Result:** 1 query instead of N+1 queries

---

#### 2. Search Performance
For large datasets, consider using **full-text search** instead of LIKE:

**Current:**
```sql
WHERE places.name LIKE '%temple%' OR places.description LIKE '%temple%'
```

**Optimized (with FULLTEXT index):**
```sql
WHERE MATCH(places.name, places.description) AGAINST('temple' IN NATURAL LANGUAGE MODE)
```

---

#### 3. Transaction Usage
All write operations use transactions to ensure data consistency:

```php
DB::beginTransaction();
try {
    // Multiple queries here
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    // Handle error
}
```

**Benefits:**
- Ensures all-or-nothing operations
- Prevents partial data insertion
- Maintains referential integrity

---

## Query Execution Order

### Example: Creating a Trip

1. **BEGIN TRANSACTION**
2. **INSERT** into `trips` table
3. **GET** newly created `trip_id`
4. **Bulk INSERT** into `trip_days` (all days at once)
5. **SELECT** trip details
6. **SELECT** all trip days
7. **COMMIT TRANSACTION**

**Total Queries:** 6 queries in 1 transaction

---

### Example: Adding Places to Trip Day

1. **BEGIN TRANSACTION**
2. **SELECT** with JOIN to verify authorization
3. **Bulk INSERT** into `trip_places`
4. **SELECT** with JOINs to fetch added places
5. **COMMIT TRANSACTION**

**Total Queries:** 4 queries in 1 transaction

---

## Security Considerations

### Authorization Checks

Every query that accesses user-specific data includes authorization:

```sql
-- Always verify ownership through user_id
WHERE trips.user_id = ?

-- Or through JOIN
FROM trip_days
INNER JOIN trips ON trip_days.trip_id = trips.trip_id
WHERE trips.user_id = ?
```

This prevents users from accessing other users' trips, days, or places.

---

### SQL Injection Prevention

All queries use **parameterized queries** (prepared statements) via Laravel's query builder:

```php
// Safe - uses parameterized query
->where('trip_id', $tripId)

// Never do this:
// ->whereRaw("trip_id = $tripId") // UNSAFE!
```

Laravel automatically escapes all parameters to prevent SQL injection.

---

## Performance Metrics

### Expected Query Counts per API Call

| Endpoint | Queries | Transaction | Notes |
|----------|---------|-------------|-------|
| Create Trip | 6 | Yes | 1 insert trip, 1 bulk insert days, 2 selects |
| Get All Trips | 1 + N | No | 1 for trips, N for day counts (can be optimized to 1) |
| Get Trip Details | 2 | No | 1 for trip, 1 for days |
| Get Trip Day Places | 2 | No | 1 for verification, 1 for places with joins |
| Add Places to Day | 4 | Yes | 1 verify, 1 bulk insert, 1 select results |
| Get Places (Selection) | 2 | No | 1 for count, 1 for results |
| Get Place Details | 1 | No | Single query with joins |
| Get Popular Places | 1 | No | Single query with sorting |

---

## Conclusion

This document covers all SQL queries used in the Trip Management system. All queries are:

- ✅ **Secure** - Use parameterized queries and authorization checks
- ✅ **Efficient** - Use JOINs to minimize query count
- ✅ **Consistent** - Use transactions for write operations
- ✅ **Maintainable** - Follow Laravel query builder patterns

For questions or optimization suggestions, refer to the codebase or contact the development team.
