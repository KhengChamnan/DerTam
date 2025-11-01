# Admin Portal Access Restriction Implementation

## Overview

This implementation prevents users with only the "user" role from accessing the admin portal web interface, while still allowing them to use the mobile app and user web interface through API routes.

## Changes Made

### 1. Created RestrictAdminPortalAccess Middleware

**File:** `backend/app/Http/Middleware/RestrictAdminPortalAccess.php`

This middleware:

-   Checks if the authenticated user has only the 'user' role
-   If yes, logs them out and redirects to login with an error message
-   Allows users with 'admin' or 'superadmin' roles to proceed

### 2. Registered Middleware Alias

**File:** `backend/bootstrap/app.php`

Added the middleware alias `'admin.portal'` to make it easy to apply to routes.

### 3. Updated Login Controller

**File:** `backend/app/Http/Controllers/Auth/AuthenticatedSessionController.php`

Modified the `store()` method to:

-   Check user role before completing the login
-   Reject login attempts from users with only the 'user' role
-   Display a clear error message directing them to use mobile/web user interface

### 4. Applied Middleware to Web Routes

**File:** `backend/routes/web.php`

Added `'admin.portal'` middleware to the main authenticated routes group that includes:

-   Dashboard
-   Places management
-   User management
-   Role management

## How It Works

### For Admin/Superadmin Users:

1. Can log in to the admin portal normally
2. Have full access to all admin features
3. Can access dashboard, user management, role management, etc.

### For Regular Users:

1. **Cannot log in to admin portal** - will see error message at login
2. **Can still use API routes** - all `/api/*` routes use `auth:sanctum` middleware
3. **Mobile app access** - unaffected, uses API routes with Sanctum tokens
4. **User web interface** - unaffected, uses API routes with Sanctum tokens

### Two Layers of Protection:

1. **Login Prevention:** Check at login in `AuthenticatedSessionController`
2. **Access Prevention:** Middleware check on all authenticated admin portal routes

## API Routes (Still Accessible for All Users)

The following routes in `routes/api.php` remain accessible to all authenticated users:

-   `/api/register` - Registration
-   `/api/login` - API login (for mobile/web)
-   `/api/auth/google` - Google OAuth
-   `/api/products` - Product management
-   `/api/places/*` - Place browsing and recommendations
-   All other API endpoints

## Testing the Implementation

### Test Case 1: Admin/Superadmin Login

1. Go to admin portal login page
2. Log in with admin/superadmin credentials
3. Should successfully access dashboard

### Test Case 2: Regular User Login (Blocked)

1. Go to admin portal login page
2. Log in with regular user credentials
3. Should see error: "You do not have permission to access the admin portal. Please use the mobile app or user web interface."

### Test Case 3: API Access (Should Work)

1. Use mobile app or web user interface
2. Log in with regular user credentials via `/api/login`
3. Should successfully authenticate and access all user features

### Test Case 4: Middleware Protection

1. If a regular user somehow bypasses login (e.g., via direct URL)
2. Middleware will log them out automatically
3. Redirect to login with error message

## Error Messages

The system displays user-friendly error messages:

-   "You do not have permission to access the admin portal. Please use the mobile app or user web interface."

This clearly directs users to the appropriate interface for their access level.

## Security Notes

-   Users with only 'user' role are completely blocked from admin portal
-   API routes remain accessible for mobile and web user interfaces
-   Two-layer protection ensures no bypass scenarios
-   Session is invalidated if unauthorized access is attempted
