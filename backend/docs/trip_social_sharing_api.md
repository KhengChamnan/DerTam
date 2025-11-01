# Trip Social Sharing API Documentation

**Base URL:** `http://127.0.0.1:8000/api` (Development)

**Authentication:** Most endpoints require Bearer token authentication via Laravel Sanctum. The resolve endpoint handles authentication internally.

**Header Requirements:**
```dart
{
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

---

## Table of Contents
1. [Overview](#overview)
2. [Database Structure](#database-structure)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Flutter Integration Guide](#flutter-integration-guide)

---

## Overview

The Trip Social Sharing feature allows users to:
- Generate shareable links for their trips
- Share trips with friends via links
- View shared trips (view-only access)
- Track who has accessed their shared trips
- Set expiration dates for share links (default 30 days)
- Deactivate share links

### Key Features
- **Authentication Required**: Friends must have an account to access shared trips
- **View-Only Access**: Shared trips can only be viewed, not edited
- **Expiration Dates**: Share links expire after 30 days (configurable)
- **Access Tracking**: Trip owners can see who accessed their shared trips
- **Security**: Proper authorization checks ensure only trip owners can manage shares

---

## Database Structure

### trip_shares Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| trip_id | bigint | Foreign key to trips table |
| token | string(64) | Unique token for share link |
| expires_at | timestamp | Expiration date (nullable, default 30 days) |
| is_active | boolean | Whether the share is active (default true) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### trip_share_accesses Table
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| trip_share_id | bigint | Foreign key to trip_shares table |
| user_id | bigint | Foreign key to users table (who accessed) |
| accessed_at | timestamp | When the trip was accessed |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

---

## API Endpoints

### 1. Generate Share Link

**Endpoint:** `GET /api/trip/{trip_id}/share`

**Description:** Generates a shareable link for a trip. Requires authentication and trip ownership.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `trip_id` (integer, required) - The ID of the trip to share

**Response:**
```json
{
  "success": true,
  "message": "Share link generated successfully",
  "data": {
    "share_link": "https://myapp.com/share/trip/abc123xyz456",
    "token": "abc123xyz456",
    "expires_at": "2025-12-01T12:44:32.000000Z",
    "created_at": "2025-11-01T12:44:32.000000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Trip not found or user doesn't own the trip

---

### 2. Resolve Shared Trip

**Endpoint:** `GET /api/trip/share/{token}`

**Description:** Resolves a shared trip link. Requires authentication. Tracks access for the trip owner.

**Authentication:** Required (handled internally, returns 401 if not authenticated)

**URL Parameters:**
- `token` (string, required) - The share token from the share link

**Response:**
```json
{
  "success": true,
  "message": "Trip accessed successfully",
  "data": {
    "trip": {
      "trip_id": 1,
      "user_id": 1,
      "trip_name": "Summer Vacation 2025",
      "start_date": "2025-10-20",
      "end_date": "2025-10-25",
      "created_at": "2025-10-15T10:00:00.000000Z",
      "updated_at": "2025-10-15T10:00:00.000000Z"
    },
    "days": [
      {
        "trip_day_id": 1,
        "trip_id": 1,
        "date": "2025-10-20",
        "day_number": 1,
        "places": [
          {
            "trip_place_id": 1,
            "trip_day_id": 1,
            "place_id": 10,
            "notes": "Visit in the morning",
            "added_at": "2025-10-16T09:00:00.000000Z",
            "place_name": "Angkor Wat",
            "place_description": "Ancient temple complex",
            "category_id": 1,
            "category_name": "Historical Site",
            "google_maps_link": "https://maps.google.com/...",
            "ratings": 4.8,
            "reviews_count": 1250,
            "images_url": "https://example.com/image.jpg",
            "entry_free": false,
            "operating_hours": "06:00-18:00",
            "province_id": 1,
            "province_categoryName": "Siem Reap",
            "latitude": 13.4125,
            "longitude": 103.8670
          }
        ]
      }
    ],
    "access_type": "view_only"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Invalid or expired link
- `410 Gone` - Share link has expired

---

### 3. Get Access List

**Endpoint:** `GET /api/trip/{trip_id}/share/accesses`

**Description:** Gets the list of users who have accessed a shared trip. Only trip owner can access this.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `trip_id` (integer, required) - The ID of the trip

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
        "avatar": "https://example.com/avatar.jpg",
        "accessed_at": "2025-11-01T10:30:00.000000Z"
      },
      {
        "user_id": 3,
        "user_name": "Jane Smith",
        "user_email": "jane@example.com",
        "avatar": null,
        "accessed_at": "2025-11-01T11:15:00.000000Z"
      }
    ],
    "total_accesses": 2
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Trip not found, user doesn't own the trip, or no share link exists

---

### 4. Deactivate Share Link

**Endpoint:** `DELETE /api/trip/{trip_id}/share`

**Description:** Deactivates a share link for a trip. Only trip owner can do this.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `trip_id` (integer, required) - The ID of the trip

**Response:**
```json
{
  "success": true,
  "message": "Share link deactivated successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Trip not found, user doesn't own the trip, or no share link exists

---

## Request/Response Examples

### Flutter Example: Generate Share Link

```dart
Future<Map<String, dynamic>> generateShareLink(int tripId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip/$tripId/share'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to generate share link');
  }
}

// Usage
final result = await generateShareLink(1);
String shareLink = result['data']['share_link'];
```

### Flutter Example: Resolve Shared Trip

```dart
Future<Map<String, dynamic>> resolveSharedTrip(String token) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip/share/$token'),
    headers: {
      'Authorization': 'Bearer $token', // User's auth token
      'Accept': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    // Redirect to login
    throw Exception('Authentication required');
  } else if (response.statusCode == 410) {
    throw Exception('Share link has expired');
  } else {
    throw Exception('Invalid or expired link');
  }
}

// Usage
try {
  final result = await resolveSharedTrip('abc123xyz456');
  var trip = result['data']['trip'];
  var days = result['data']['days'];
  // Display trip details
} catch (e) {
  // Handle error (show login screen or error message)
}
```

### Flutter Example: Get Access List

```dart
Future<Map<String, dynamic>> getAccessList(int tripId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip/$tripId/share/accesses'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}

// Usage
final result = await getAccessList(1);
List accesses = result['data']['accesses'];
int total = result['data']['total_accesses'];
```

### Flutter Example: Deactivate Share Link

```dart
Future<bool> deactivateShareLink(int tripId) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/trip/$tripId/share'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return response.statusCode == 200;
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error message (in development)"
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | Success | Request completed successfully |
| 401 | Unauthorized | User not authenticated or invalid token |
| 404 | Not Found | Resource not found or user doesn't have permission |
| 410 | Gone | Share link has expired |
| 422 | Validation Error | Request validation failed |
| 500 | Server Error | Internal server error |

### Common Error Scenarios

1. **User tries to access shared trip without authentication**
   - Status: `401 Unauthorized`
   - Message: "Authentication required. Please log in to view shared trip."
   - Action: Redirect user to login screen

2. **Share link has expired**
   - Status: `410 Gone`
   - Message: "Share link has expired"
   - Action: Show expiration message to user

3. **Invalid share token**
   - Status: `404 Not Found`
   - Message: "Invalid or expired link"
   - Action: Show error message

4. **User tries to access trip they don't own**
   - Status: `404 Not Found`
   - Message: "Trip not found or unauthorized"
   - Action: Show error message

---

## Flutter Integration Guide

### Deep Link Handling

When a user opens a share link in your Flutter app, you need to:

1. **Extract the token from the URL**
   ```dart
   // Example: https://myapp.com/share/trip/abc123xyz456
   String? extractTokenFromUrl(String url) {
     final uri = Uri.parse(url);
     final pathSegments = uri.pathSegments;
     if (pathSegments.length >= 3 && pathSegments[1] == 'share') {
       return pathSegments[2]; // 'abc123xyz456'
     }
     return null;
   }
   ```

2. **Check if user is authenticated**
   ```dart
   bool isAuthenticated = await checkAuthStatus();
   if (!isAuthenticated) {
     // Redirect to login, store token for after login
     Navigator.pushNamed(context, '/login', arguments: token);
   } else {
     // Resolve the shared trip
     await resolveSharedTrip(token);
   }
   ```

3. **Navigate to trip detail screen**
   ```dart
   void handleShareLink(String token) async {
     try {
       final result = await resolveSharedTrip(token);
       Navigator.pushNamed(
         context,
         '/trip-detail',
         arguments: {
           'trip': result['data']['trip'],
           'days': result['data']['days'],
           'isShared': true,
           'isViewOnly': true,
         },
       );
     } catch (e) {
       // Handle error
       showErrorDialog(e.toString());
     }
   }
   ```

### Complete Flutter Integration Example

```dart
class TripShareService {
  final String baseUrl = 'http://127.0.0.1:8000/api';
  final String? authToken;

  TripShareService(this.authToken);

  // Generate share link
  Future<String> generateShareLink(int tripId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip/$tripId/share'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['share_link'];
    } else {
      throw Exception('Failed to generate share link');
    }
  }

  // Resolve shared trip
  Future<SharedTripData> resolveSharedTrip(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip/share/$token'),
      headers: {
        if (authToken != null) 'Authorization': 'Bearer $authToken',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return SharedTripData.fromJson(data['data']);
    } else if (response.statusCode == 401) {
      throw UnauthenticatedException('Please log in to view shared trip');
    } else if (response.statusCode == 410) {
      throw ExpiredLinkException('Share link has expired');
    } else {
      throw Exception('Invalid or expired link');
    }
  }

  // Get access list
  Future<List<UserAccess>> getAccessList(int tripId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip/$tripId/share/accesses'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['data']['accesses'] as List)
          .map((e) => UserAccess.fromJson(e))
          .toList();
    } else {
      throw Exception('Failed to get access list');
    }
  }

  // Deactivate share link
  Future<void> deactivateShareLink(int tripId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/trip/$tripId/share'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to deactivate share link');
    }
  }
}
```

---

## Security Considerations

1. **Token Security**: Share tokens are randomly generated 32-character strings
2. **Expiration**: Links automatically expire after 30 days
3. **Access Control**: Only trip owners can generate, view access list, and deactivate shares
4. **Authentication**: All endpoints require proper authentication
5. **View-Only**: Shared trips can only be viewed, not edited

---

## Database Migration

To apply the database changes, run:

```bash
php artisan migrate
```

This will:
- Add `expires_at` and `is_active` columns to `trip_shares` table
- Create `trip_share_accesses` table

---

## Notes

- Share links expire 30 days after generation (configurable in code)
- Access is tracked once per user per share link
- If a share link is deactivated, it cannot be accessed even if not expired
- The resolve endpoint requires authentication but is placed outside the auth middleware to handle the flow gracefully

---

## Testing

Use the following Postman collection endpoints to test:

1. **Generate Share Link**: `GET /api/trip/{trip_id}/share` (with auth)
2. **Resolve Shared Trip**: `GET /api/trip/share/{token}` (with auth)
3. **Get Access List**: `GET /api/trip/{trip_id}/share/accesses` (with auth)
4. **Deactivate Share**: `DELETE /api/trip/{trip_id}/share` (with auth)

---

**Last Updated:** November 1, 2025

