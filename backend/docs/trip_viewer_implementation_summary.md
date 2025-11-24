# Trip Viewer Implementation Summary

## Overview
This document summarizes the Trip Viewer feature implementation, which allows users to share trips via links and automatically grants viewers permanent access to those trips.

## Database Structure

### 1. `trip_shares` Table
Stores shareable links for trips.

**Columns:**
- `id` - Primary key
- `trip_id` - Foreign key to trips table
- `token` - Unique 64-character token for share URL
- `expires_at` - Nullable timestamp (default: 30 days from creation)
- `is_active` - Boolean flag to enable/disable sharing
- `created_at`, `updated_at` - Timestamps

**Migration Files:**
- `2025_10_27_074240_create_trip_shares_table.php`
- `2025_11_01_124432_add_expiration_to_trip_shares_table.php`

### 2. `trip_share_accesses` Table
Tracks individual access events when users click on share links.

**Columns:**
- `id` - Primary key
- `trip_share_id` - Foreign key to trip_shares table
- `user_id` - Foreign key to users table (who accessed)
- `accessed_at` - Timestamp of access
- `created_at`, `updated_at` - Timestamps

**Unique Constraint:** (`trip_share_id`, `user_id`) - Each user counted once per share

**Migration File:**
- `2025_11_01_124443_create_trip_share_accesses_table.php`

### 3. `trip_viewers` Table
Grants permanent viewer access to users who have accessed shared trips.

**Columns:**
- `id` - Primary key
- `trip_id` - Foreign key to trips table
- `user_id` - Foreign key to users table (the viewer)
- `created_at`, `updated_at` - Timestamps

**Unique Constraint:** (`trip_id`, `user_id`) - Each user can only be viewer once per trip

**Migration File:**
- `2025_11_01_150000_create_trip_viewers_table.php`

## Models

### TripShare Model
**Location:** `app/Models/TripShare.php`

**Fillable:**
- `trip_id`, `token`, `expires_at`, `is_active`

**Relationships:**
- `trip()` - BelongsTo Trip
- `accesses()` - HasMany TripShareAccess

**Key Methods:**
- `scopeValid()` - Query scope for non-expired, active shares
- `isExpired()` - Check if share is expired
- `isValid()` - Check if share is active and not expired

### TripShareAccess Model
**Location:** `app/Models/TripShareAccess.php`

**Fillable:**
- `trip_share_id`, `user_id`, `accessed_at`

**Relationships:**
- `tripShare()` - BelongsTo TripShare
- `user()` - BelongsTo User

### TripViewer Model
**Location:** `app/Models/TripViewer.php`

**Fillable:**
- `trip_id`, `user_id`

**Relationships:**
- `trip()` - BelongsTo Trip
- `user()` - BelongsTo User

### Trip Model Updates
**Location:** `app/Models/Trip.php`

**Added Relationship:**
```php
public function viewers(): HasMany
{
    return $this->hasMany(TripViewer::class, 'trip_id', 'trip_id');
}
```

### User Model Updates
**Location:** `app/Models/User.php`

**Added Relationship:**
```php
public function tripViewers(): HasMany
{
    return $this->hasMany(TripViewer::class, 'user_id', 'id');
}
```

## API Endpoints

### 1. Generate Share Link
**Endpoint:** `POST /api/trips/{trip_id}/share/generate`

**Controller:** `TripShareController@generate`

**Authentication:** Required (Owner only)

**Process:**
1. Verifies user owns the trip
2. Creates/updates TripShare record
3. Generates 32-character random token
4. Sets expiration to 30 days
5. Returns share link

**Response:**
```json
{
  "success": true,
  "message": "Share link generated successfully",
  "data": {
    "share_link": "https://myapp.com/share/trip/{token}",
    "token": "abc123...",
    "expires_at": "2025-12-01T00:00:00.000Z",
    "created_at": "2025-11-01T00:00:00.000Z"
  }
}
```

### 2. Resolve Share Link (Access Shared Trip)
**Endpoint:** `GET /api/trips/share/resolve/{token}`

**Controller:** `TripShareController@resolve`

**Authentication:** Required (Any authenticated user)

**Process:**
1. Validates token (must be active and not expired)
2. Fetches trip with all days and places
3. **Creates TripShareAccess record** (tracks access)
4. **Creates TripViewer record** (grants permanent access) ✨
5. Returns trip data

**Response:**
```json
{
  "success": true,
  "message": "Trip accessed successfully",
  "data": {
    "trip": { /* trip details */ },
    "days": [ /* array of trip days with places */ ],
    "access_type": "view_only"
  }
}
```

**Key Implementation:**
```php
// Track access
TripShareAccess::firstOrCreate([
    'trip_share_id' => $share->id,
    'user_id' => $userId,
], [
    'accessed_at' => now(),
]);

// Add user as a viewer (permanent access)
TripViewer::firstOrCreate([
    'trip_id' => $share->trip_id,
    'user_id' => $userId,
]);
```

### 3. Get Access List
**Endpoint:** `GET /api/trips/{trip_id}/share/accesses`

**Controller:** `TripShareController@getAccessList`

**Authentication:** Required (Owner only)

**Returns:** List of users who accessed the shared trip with timestamps

**Response:**
```json
{
  "success": true,
  "data": {
    "accesses": [
      {
        "user_id": 1,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "avatar": "...",
        "accessed_at": "2025-11-01T10:00:00.000Z"
      }
    ],
    "total_accesses": 5
  }
}
```

### 4. Deactivate Share Link
**Endpoint:** `POST /api/trips/{trip_id}/share/deactivate`

**Controller:** `TripShareController@deactivateShare`

**Authentication:** Required (Owner only)

**Process:**
1. Verifies user owns the trip
2. Sets `is_active = false` on TripShare
3. Link becomes invalid for new accesses
4. Existing viewers retain access

## Trip List Integration

### Updated Trip Index Endpoint
**Endpoint:** `GET /api/trips`

**Controller:** `TripController@index`

**Process:**
1. Fetches owned trips (where `user_id` = authenticated user)
2. Fetches viewed trips (from `trip_viewers` table)
3. Merges both lists
4. Adds `trip_access_type` field:
   - `'owned'` - User created the trip
   - `'shared'` - User is a viewer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "trip_id": 1,
      "trip_name": "My Vacation",
      "trip_access_type": "owned",
      "days_count": 5
    },
    {
      "trip_id": 2,
      "trip_name": "Friend's Trip",
      "trip_access_type": "shared",
      "days_count": 3
    }
  ]
}
```

## User Flow

### Sharing a Trip
1. User creates a trip
2. User clicks "Share" button
3. App calls `POST /api/trips/{trip_id}/share/generate`
4. User receives shareable link
5. User shares link with friends via WhatsApp, email, etc.

### Accessing a Shared Trip
1. Friend clicks on the shared link
2. App redirects to login (if not authenticated)
3. After login, app calls `GET /api/trips/share/resolve/{token}`
4. **Friend is added to `trip_viewers` table** ✨
5. Friend sees the trip details
6. **Trip now appears in friend's trip list permanently**

### Viewing Shared Trips Later
1. Friend opens the app
2. App calls `GET /api/trips`
3. Friend sees both owned and shared trips
4. Shared trips are marked with `trip_access_type: 'shared'`
5. Friend can view trip details anytime (no link needed)

## Key Features

### ✅ Automatic Viewer Access
- When a user clicks a share link, they're automatically added to `trip_viewers`
- No manual approval needed
- Access persists even if share link expires or is deactivated

### ✅ View-Only Access
- Viewers can see trip details, days, and places
- Viewers cannot edit or delete the trip
- Only owner can modify the trip

### ✅ Access Tracking
- Every access is logged in `trip_share_accesses`
- Owner can see who accessed their trip and when
- Useful for analytics and security

### ✅ Link Expiration
- Default: 30 days
- Prevents unauthorized access after expiration
- Existing viewers retain access

### ✅ Link Deactivation
- Owner can manually deactivate links
- Prevents new accesses
- Existing viewers retain access

### ✅ Duplicate Prevention
- Unique constraints prevent duplicate records
- `firstOrCreate()` ensures idempotent operations

## Security Considerations

1. **Authentication Required:** Users must be logged in to access shared trips
2. **Token Validation:** Checks for expiration and active status
3. **Owner Verification:** Only trip owner can generate/deactivate links
4. **Database Constraints:** Unique constraints prevent data duplication
5. **Cascading Deletes:** Deleting a trip removes all shares, accesses, and viewers

## Future Enhancements (Potential)

- [ ] Configurable expiration duration
- [ ] Permission levels (view, comment, edit)
- [ ] Share via email invitation
- [ ] Notification when someone accesses shared trip
- [ ] Revoke individual viewer access
- [ ] Analytics dashboard for trip owners
- [ ] Share statistics (views, clicks)

## Testing Checklist

- [ ] Generate share link as trip owner
- [ ] Access shared trip as authenticated user
- [ ] Verify viewer appears in `trip_viewers` table
- [ ] Verify shared trip appears in viewer's trip list
- [ ] Test expired link handling
- [ ] Test deactivated link handling
- [ ] Test access list retrieval
- [ ] Test unauthorized access attempts
- [ ] Test duplicate access prevention

## Related Documentation

- `trip_management_api_for_flutter.md` - Main trip API documentation
- `trip_social_sharing_api.md` - Social sharing implementation
- `SOCIAL_SHARING_IMPLEMENTATION.md` - Social sharing setup guide
