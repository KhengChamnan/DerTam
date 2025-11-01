# Social Sharing API Implementation Summary

## Overview
This document summarizes the implementation of a social sharing feature for trips in the booking hotel application. The feature allows users to generate shareable links for their trips with expiration dates and access tracking.

---

## Features Implemented

### 1. Shareable Trip Links
- Users can generate secure, unique shareable links for their trips
- Each link contains a 32-character random token
- Links default to expire after 30 days
- Links can be deactivated at any time by the trip owner

### 2. Expiration Management
- Automatic expiration checking for all share links
- Configurable expiration dates (default: 30 days)
- Support for never-expiring links
- Clear distinction between expired and invalid links (410 Gone status for expired)

### 3. Access Tracking
- Tracks which users have accessed shared trips
- Records the timestamp of each access
- Prevents duplicate access records for the same user
- Only trip owners can view the access list

### 4. Security & Authentication
- All sharing endpoints require authentication
- Only trip owners can generate, view accesses, and deactivate shares
- Recipients must be logged in to access shared trips
- Validation of trip ownership on all operations

---

## Database Schema Changes

### New Table: `trip_share_accesses`
Tracks who accessed each shared trip.

```sql
- id (primary key)
- trip_share_id (foreign key → trip_shares.id)
- user_id (foreign key → users.id)
- accessed_at (timestamp)
- timestamps (created_at, updated_at)
```

**Constraints:**
- Unique constraint on (`trip_share_id`, `user_id`) to prevent duplicate records
- Cascade delete when trip_share or user is deleted

### Modified Table: `trip_shares`
Added expiration and activation management.

**New Columns:**
- `expires_at` (timestamp, nullable) - Link expiration date
- `is_active` (boolean, default: true) - Manual activation/deactivation flag

---

## API Endpoints

### 1. Generate Share Link
**Endpoint:** `GET /api/trip/{trip_id}/share`  
**Authentication:** Required  
**Authorization:** Trip owner only  
**Description:** Creates or updates a share link for the specified trip.

**Response:**
```json
{
  "success": true,
  "message": "Share link generated successfully",
  "data": {
    "share_link": "https://myapp.com/share/trip/{token}",
    "token": "abc123...",
    "expires_at": "2025-12-01T00:00:00.000000Z",
    "created_at": "2025-11-01T00:00:00.000000Z"
  }
}
```

**Behavior:**
- Uses `updateOrCreate` to regenerate token on each call
- Sets 30-day expiration by default
- Returns the same link if already exists

---

### 2. Resolve Shared Trip
**Endpoint:** `GET /api/trip/share/{token}`  
**Authentication:** Required  
**Authorization:** Any authenticated user  
**Description:** Retrieves trip details when a user opens a share link.

**Response:**
```json
{
  "success": true,
  "message": "Trip accessed successfully",
  "data": {
    "trip": { /* trip details */ },
    "days": [
      {
        "trip_day_id": 1,
        "date": "2025-11-15",
        "places": [ /* place details */ ]
      }
    ],
    "access_type": "view_only"
  }
}
```

**Behavior:**
- Validates token exists, is active, and not expired
- Returns 401 if user not authenticated
- Returns 410 if link is expired
- Returns 404 if link is invalid
- Automatically tracks user access
- Retrieves complete trip structure with days and places

---

### 3. Get Access List
**Endpoint:** `GET /api/trip/{trip_id}/share/accesses`  
**Authentication:** Required  
**Authorization:** Trip owner only  
**Description:** Lists all users who have accessed the shared trip.

**Response:**
```json
{
  "success": true,
  "data": {
    "accesses": [
      {
        "user_id": 2,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "avatar": "https://...",
        "accessed_at": "2025-11-01T10:30:00.000000Z"
      }
    ],
    "total_accesses": 1
  }
}
```

**Behavior:**
- Only trip owners can access this endpoint
- Returns list sorted by most recent access first
- Includes user profile information

---

### 4. Deactivate Share Link
**Endpoint:** `DELETE /api/trip/{trip_id}/share`  
**Authentication:** Required  
**Authorization:** Trip owner only  
**Description:** Manually deactivates a share link.

**Response:**
```json
{
  "success": true,
  "message": "Share link deactivated successfully"
}
```

**Behavior:**
- Sets `is_active` to false
- Link becomes permanently inaccessible
- Cannot be reactivated (must generate new link)

---

## Models

### TripShare Model
**Location:** `app/Models/TripShare.php`

**Key Features:**
- **Scope:** `valid()` - Filters for non-expired, active shares
- **Methods:**
  - `isExpired()` - Checks if share has expired
  - `isValid()` - Checks if share is valid (active and not expired)

**Relationships:**
- `belongsTo(Trip)` - The shared trip
- `hasMany(TripShareAccess)` - Access records

---

### TripShareAccess Model
**Location:** `app/Models/TripShareAccess.php`

**Key Features:**
- Tracks individual user accesses
- Prevents duplicate tracking with unique constraint

**Relationships:**
- `belongsTo(TripShare)` - The share link accessed
- `belongsTo(User)` - The user who accessed

---

### Trip Model Updates
**Location:** `app/Models/Trip.php`

**New Relationship:**
- `hasMany(TripShare)` - All shares for this trip

---

## Controller

### TripShareController
**Location:** `app/Http/Controllers/API/Trip/TripShareController.php`

**Methods:**
1. `generate($trip_id)` - Generate/update share link
2. `resolve($token)` - Resolve and return shared trip
3. `getAccessList($trip_id)` - Get list of users who accessed
4. `deactivateShare($trip_id)` - Deactivate share link

**Security Measures:**
- All methods verify user authentication
- Owner verification on all trip operations
- Token validation with expiration checks
- Proper HTTP status codes (401, 404, 410)

---

## Migrations

### 1. Add Expiration to Trip Shares
**File:** `database/migrations/2025_11_01_124432_add_expiration_to_trip_shares_table.php`

**Changes:**
- Adds `expires_at` timestamp column
- Adds `is_active` boolean column
- Both columns are nullable with defaults

---

### 2. Create Trip Share Accesses Table
**File:** `database/migrations/2025_11_01_124443_create_trip_share_accesses_table.php`

**Changes:**
- Creates new table for tracking accesses
- Adds foreign key constraints with cascade delete
- Adds unique constraint on (`trip_share_id`, `user_id`)

---

## Routes

**Location:** `routes/api.php`

```php
// Public route for resolving shares (requires auth internally)
Route::get('/trip/share/{token}', [TripShareController::class, 'resolve']);

// Protected routes (owner only)
Route::controller(TripShareController::class)->group(function() {
    Route::get('/trip/{trip_id}/share', 'generate');
    Route::get('/trip/{trip_id}/share/accesses', 'getAccessList');
    Route::delete('/trip/{trip_id}/share', 'deactivateShare');
});
```

---

## Technical Highlights

### 1. Proper HTTP Status Codes
- `200` - Success
- `401` - Unauthorized (not authenticated)
- `404` - Not found (invalid link)
- `410` - Gone (expired link)
- `500` - Server error

### 2. Database Queries
- Uses `DB::table()` for complex joins in `resolve()` method
- Retrieves complete trip structure with nested days and places
- Efficient access tracking with `firstOrCreate()`

### 3. Validation & Error Handling
- Comprehensive error handling in all methods
- Clear error messages for different failure scenarios
- Ownership verification on all operations

### 4. Security Features
- Random 32-character tokens
- Authentication required for all endpoints
- Ownership verification
- Expiration and deactivation support

---

## Usage Flow

### For Trip Owners:
1. Generate share link: `GET /api/trip/{id}/share`
2. Share link via messaging/social media
3. View who accessed: `GET /api/trip/{id}/share/accesses`
4. Deactivate if needed: `DELETE /api/trip/{id}/share`

### For Recipients:
1. Receive share link
2. Click link (handled by Flutter app)
3. Flutter app calls: `GET /api/trip/share/{token}`
4. App displays trip details in read-only mode

---

## Future Enhancements (Not Implemented)
- Custom expiration dates
- Share link analytics/metrics
- Notification when someone accesses your shared trip
- Multiple access levels (view-only, edit, etc.)
- Share link preview/metadata

---

## Files Changed/Created

### Modified Files:
- `app/Http/Controllers/API/Trip/TripShareController.php`
- `app/Models/Trip.php`
- `app/Models/TripShare.php`
- `routes/api.php`

### New Files:
- `app/Models/TripShareAccess.php`
- `database/migrations/2025_11_01_124432_add_expiration_to_trip_shares_table.php`
- `database/migrations/2025_11_01_124443_create_trip_share_accesses_table.php`

---

## Testing Recommendations

1. **Generate Link:** Verify token generation and expiration setting
2. **Expiration:** Test expired link handling (410 response)
3. **Access Tracking:** Verify no duplicate access records
4. **Authorization:** Test that only owners can generate/deactivate
5. **Authentication:** Test that all endpoints require auth
6. **Invalid Tokens:** Test 404 responses for invalid tokens

---

## Implementation Date
November 1, 2025

## Branch
`social_sharing_api`

