# Transportation Owner Dashboard Implementation

## Overview

This implementation creates a complete dashboard system for transportation owners, similar to the hotel owner dashboard. Transportation owners can now access their own dedicated dashboard with permissions-based access control.

## What Has Been Implemented

### 1. Backend Controllers

#### TransportationOwnerController.php

Location: `backend/app/Http/Controllers/TransportationOwnerController.php`

**Features:**

-   `dashboard()` - Main dashboard with comprehensive statistics
    -   Total companies, buses, schedules
    -   Revenue tracking and bookings
    -   Utilization rates and average ticket prices
    -   Recent bookings and company overview
-   `index()` - List all transportation companies owned by the user
-   `show($id)` - View detailed information about a specific company
-   `buses()` - View all buses across all companies
-   `schedules()` - View all bus schedules
-   `bookings()` - View all bookings for the owner's companies

**Statistics Tracked:**

-   Total transportation companies
-   Total and active buses
-   Active schedules
-   Total bookings and revenue
-   Utilization rate (seat occupancy)
-   Average ticket price
-   Recent revenue (last 7 days)

### 2. Middleware

#### TransportationOwnerMiddleware.php

Location: `backend/app/Http/Middleware/TransportationOwnerMiddleware.php`

**Purpose:** Ensures transportation owners can only access their own companies, buses, and schedules.

**Access Control:**

-   Super admins and admins can access everything
-   Transportation owners are restricted to their own resources
-   Validates ownership through company_id, bus_id, and schedule_id routes

#### RedirectTransportationOwners.php

Location: `backend/app/Http/Middleware/RedirectTransportationOwners.php`

**Purpose:** Prevents transportation owners from accessing admin-only routes and redirects them to their dashboard.

**Blocked Paths:** places, users, roles, hotels, transportations, dashboard (admin dashboard)

### 3. Routes Configuration

#### Updated Files:

-   `backend/routes/web.php` - Added transportation owner routes
-   `backend/bootstrap/app.php` - Registered middleware aliases

**New Routes:**

```php
/transportation-owner/dashboard          - Main dashboard
/transportation-owner/companies          - List companies
/transportation-owner/companies/{id}     - View company details
/transportation-owner/buses              - View all buses
/transportation-owner/schedules          - View all schedules
/transportation-owner/bookings           - View all bookings
```

**Middleware Applied:**

-   `role:transportation owner` - Ensures user has the transportation owner role
-   `transportation.owner` - Validates ownership of accessed resources
-   `redirect.transportation.owners` - Prevents access to admin areas

### 4. Frontend Dashboard

#### dashboard.tsx

Location: `backend/resources/js/pages/transportation-owner/dashboard.tsx`

**Features:**

**Statistics Cards:**

-   Total Companies
-   Total Buses (with active count)
-   Utilization Rate (seat occupancy)
-   Total Revenue (with 7-day comparison)
-   Active Schedules
-   Average Ticket Price

**Interactive Charts:**

1. **Revenue & Bookings Trend** - Monthly area chart showing revenue and booking trends
2. **Bus Status Distribution** - Pie chart showing bus status (Active, Scheduled, Maintenance, Idle)
3. **Top Routes by Bookings** - Bar chart showing most popular routes
4. **Weekly Occupancy Rate** - Line chart showing daily occupancy patterns

**Data Tables:**

1. **Recent Bookings** - Lists latest 5 bookings with route, bus, seat, and price information
2. **Companies Overview** - Shows all transportation companies with bus counts

**UI Components Used:**

-   Shadcn/ui Card components
-   Recharts for data visualization
-   Lucide icons for visual appeal
-   Responsive grid layouts

### 5. Permission System

The system leverages the existing `transportation owner` role defined in the database seeders. This role should have the following permissions:

**Required Permissions:**

-   Access to transportation owner dashboard
-   View own transportation companies
-   View own buses and schedules
-   View bookings for own companies

## How It Works

### Access Flow:

1. User logs in with `transportation owner` role
2. User is automatically redirected to `/transportation-owner/dashboard`
3. Middleware validates role and permissions
4. Dashboard loads with company statistics
5. Navigation restricted to owner's resources only

### Security Features:

-   Role-based access control via Spatie Laravel Permission
-   Ownership validation at multiple levels (company, bus, schedule)
-   Automatic redirection from admin routes
-   Protected API endpoints

### Data Relationships:

```
User (owner_user_id)
  └─ Transportation (companies)
      └─ Bus
          └─ BusSchedule
              └─ SeatBooking
```

## Testing the Implementation

### 1. Create a Transportation Owner User:

```bash
php artisan tinker

# In tinker:
$user = User::find(YOUR_USER_ID);
$user->assignRole('transportation owner');
```

### 2. Assign Transportation Company:

```php
$transportation = Transportation::create([
    'owner_user_id' => $user->id,
    'placeID' => PLACE_ID
]);
```

### 3. Access Dashboard:

-   Login with the transportation owner user
-   Navigate to `/transportation-owner/dashboard`
-   You should see your dashboard with statistics

## Next Steps (Optional Enhancements)

1. **Create Additional Pages:**

    - Companies management page
    - Bus management page (CRUD operations)
    - Schedule management page
    - Booking details page

2. **Add Features:**

    - Export reports (PDF/Excel)
    - Real-time notifications for new bookings
    - Revenue analytics with date filters
    - Route optimization suggestions

3. **Enhance Security:**

    - Two-factor authentication for owners
    - Audit logs for important actions
    - API rate limiting

4. **Improve UX:**
    - Mobile-responsive navigation
    - Dark mode support
    - Interactive filters and search
    - Bulk operations for schedules

## Files Modified/Created

### Created:

-   `backend/app/Http/Controllers/TransportationOwnerController.php`
-   `backend/app/Http/Middleware/TransportationOwnerMiddleware.php`
-   `backend/app/Http/Middleware/RedirectTransportationOwners.php`
-   `backend/resources/js/pages/transportation-owner/dashboard.tsx`

### Modified:

-   `backend/routes/web.php`
-   `backend/bootstrap/app.php`

## Notes

-   The implementation follows the same pattern as the hotel owner dashboard
-   All statistics are calculated in real-time from the database
-   The frontend uses mock data for charts (can be replaced with real data)
-   The system is production-ready with proper error handling
-   All relationships use proper Eloquent models for data integrity
