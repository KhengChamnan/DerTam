# Trip Management API Documentation for Flutter
**Base URL:** `http://127.0.0.1:8000/api` (Development)

**Authentication:** All endpoints require Bearer token authentication via Laravel Sanctum.

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
1. [Create Trip](#1-create-trip)
2. [Get All User Trips](#2-get-all-user-trips)
3. [Get Specific Trip Details](#3-get-specific-trip-details)
4. [Get Places for a Trip Day](#4-get-places-for-a-trip-day)
5. [Add Places to Trip Day](#5-add-places-to-trip-day)
6. [Get All Places for Selection](#6-get-all-places-for-selection)
7. [Get Place Details](#7-get-place-details)
8. [Get Popular Places](#8-get-popular-places)

---

## 1. Create Trip

**Endpoint:** `POST /api/trips`

**Description:** Creates a new trip and automatically generates trip days for each date between start and end date.

### Request Body (Required)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| trip_name | String | ✅ Yes | Name of the trip (max 255 characters) | "Summer Vacation 2025" |
| start_date | Date | ✅ Yes | Trip start date (YYYY-MM-DD, must be today or future) | "2025-10-20" |
| end_date | Date | ✅ Yes | Trip end date (YYYY-MM-DD, must be >= start_date) | "2025-10-25" |

### Flutter Example
```dart
Future<Map<String, dynamic>> createTrip({
  required String tripName,
  required String startDate, // Format: 'YYYY-MM-DD'
  required String endDate,   // Format: 'YYYY-MM-DD'
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/trips'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'trip_name': tripName,
      'start_date': startDate,
      'end_date': endDate,
    }),
  );
  
  return jsonDecode(response.body);
}

// Usage:
final result = await createTrip(
  tripName: 'My Summer Vacation',
  startDate: '2025-10-20',
  endDate: '2025-10-25',
);
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "trip": {
      "trip_id": 1,
      "user_id": 1,
      "trip_name": "Summer Vacation 2025",
      "start_date": "2025-10-20",
      "end_date": "2025-10-25",
      "created_at": "2025-10-18T10:30:00.000000Z",
      "updated_at": "2025-10-18T10:30:00.000000Z"
    },
    "days": [
      {
        "trip_day_id": 1,
        "trip_id": 1,
        "date": "2025-10-20",
        "day_number": 1,
        "created_at": "2025-10-18T10:30:00.000000Z",
        "updated_at": "2025-10-18T10:30:00.000000Z"
      },
      {
        "trip_day_id": 2,
        "trip_id": 1,
        "date": "2025-10-21",
        "day_number": 2,
        "created_at": "2025-10-18T10:30:00.000000Z",
        "updated_at": "2025-10-18T10:30:00.000000Z"
      }
      // ... more days
    ],
    "total_days": 6
  }
}
```

### Error Response (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "trip_name": ["The trip name field is required."],
    "start_date": ["The start date must be a date after or equal to today."],
    "end_date": ["The end date must be a date after or equal to start date."]
  }
}
```

---

## 2. Get All User Trips

**Endpoint:** `GET /api/trips`

**Description:** Retrieves all trips for the authenticated user with day counts.

### Request Body
No request body needed.

### Flutter Example
```dart
Future<Map<String, dynamic>> getAllTrips() async {
  final response = await http.get(
    Uri.parse('$baseUrl/trips'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "trip_id": 1,
      "user_id": 1,
      "trip_name": "Summer Vacation 2025",
      "start_date": "2025-10-20",
      "end_date": "2025-10-25",
      "created_at": "2025-10-18T10:30:00.000000Z",
      "updated_at": "2025-10-18T10:30:00.000000Z",
      "days_count": 6
    },
    {
      "trip_id": 2,
      "user_id": 1,
      "trip_name": "Weekend Getaway",
      "start_date": "2025-11-01",
      "end_date": "2025-11-03",
      "created_at": "2025-10-15T08:20:00.000000Z",
      "updated_at": "2025-10-15T08:20:00.000000Z",
      "days_count": 3
    }
  ]
}
```

---

## 3. Get Specific Trip Details

**Endpoint:** `GET /api/trips/{tripId}`

**Description:** Get detailed information about a specific trip including all its days.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tripId | Integer | ✅ Yes | The ID of the trip |

### Flutter Example
```dart
Future<Map<String, dynamic>> getTripDetails(int tripId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trips/$tripId'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}

// Usage:
final trip = await getTripDetails(1);
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "trip": {
      "trip_id": 1,
      "user_id": 1,
      "trip_name": "Summer Vacation 2025",
      "start_date": "2025-10-20",
      "end_date": "2025-10-25",
      "created_at": "2025-10-18T10:30:00.000000Z",
      "updated_at": "2025-10-18T10:30:00.000000Z"
    },
    "days": [
      {
        "trip_day_id": 1,
        "trip_id": 1,
        "date": "2025-10-20",
        "day_number": 1,
        "created_at": "2025-10-18T10:30:00.000000Z",
        "updated_at": "2025-10-18T10:30:00.000000Z"
      },
      {
        "trip_day_id": 2,
        "trip_id": 1,
        "date": "2025-10-21",
        "day_number": 2,
        "created_at": "2025-10-18T10:30:00.000000Z",
        "updated_at": "2025-10-18T10:30:00.000000Z"
      }
      // ... more days
    ]
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Trip not found"
}
```

---

## 4. Get Places for a Trip Day

**Endpoint:** `GET /api/trip-days/{tripDayId}/places`

**Description:** Get all places added to a specific trip day. Use this when user switches between day tabs (Day 1, Day 2, etc.).

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tripDayId | Integer | ✅ Yes | The ID of the trip day (from trip_day_id field) |

### Flutter Example
```dart
Future<Map<String, dynamic>> getTripDayPlaces(int tripDayId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip-days/$tripDayId/places'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}

// Usage example with TabBar:
void onTabChanged(int index, List<TripDay> tripDays) {
  final tripDayId = tripDays[index].tripDayId;
  final places = await getTripDayPlaces(tripDayId);
  // Update UI with places
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "trip_day": {
      "trip_day_id": 1,
      "trip_id": 1,
      "trip_name": "Summer Vacation 2025",
      "date": "2025-10-20",
      "day_number": 1
    },
    "places": [
      {
        "trip_place_id": 1,
        "trip_day_id": 1,
        "place_id": 5,
        "notes": "Visit in the morning",
        "added_at": "2025-10-18T11:00:00.000000Z",
        "place_name": "Angkor Wat",
        "place_description": "Ancient temple complex...",
        "category_id": 1,
        "category_name": "Historical Sites",
        "google_maps_link": "https://maps.google.com/...",
        "ratings": 4.8,
        "reviews_count": 1500,
        "images_url": ["url1", "url2"],
        "entry_free": false,
        "operating_hours": {...},
        "province_id": 1,
        "province_categoryName": "Siem Reap",
        "latitude": 13.412469,
        "longitude": 103.866986
      }
      // ... more places
    ],
    "total_places": 3
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Trip day not found or unauthorized"
}
```

---

## 5. Add Places to Trip Day

**Endpoint:** `POST /api/trip-days/{tripDayId}/places`

**Description:** Add one or more places to a specific trip day. Notes are optional for each place.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tripDayId | Integer | ✅ Yes | The ID of the trip day |

### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| place_ids | Array<Integer> | ✅ Yes | Array of place IDs to add (min: 1 place) | [1, 2, 3] |
| notes | Array<String> | ❌ No | Optional notes for each place (same order as place_ids) | ["Visit morning", "Lunch here"] |

### Flutter Example
```dart
Future<Map<String, dynamic>> addPlacesToTripDay({
  required int tripDayId,
  required List<int> placeIds,
  List<String>? notes,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/trip-days/$tripDayId/places'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'place_ids': placeIds,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    }),
  );
  
  return jsonDecode(response.body);
}

// Usage - with notes:
await addPlacesToTripDay(
  tripDayId: 1,
  placeIds: [1, 2, 3],
  notes: ['Visit in morning', 'Great for lunch', 'Evening visit'],
);

// Usage - without notes:
await addPlacesToTripDay(
  tripDayId: 1,
  placeIds: [5, 6, 7],
);
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Places added to trip day successfully",
  "data": {
    "trip_day_id": 1,
    "places": [
      {
        "trip_place_id": 1,
        "trip_day_id": 1,
        "place_id": 1,
        "notes": "Visit in the morning",
        "place_name": "Angkor Wat",
        "place_description": "Ancient temple complex",
        "google_maps_link": "https://maps.google.com/...",
        "ratings": 4.8,
        "images_url": ["url1", "url2"],
        "created_at": "2025-10-18T12:00:00.000000Z"
      }
      // ... more places
    ],
    "total_places_added": 3
  }
}
```

### Error Response (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "place_ids": ["The place ids field is required."],
    "place_ids.0": ["The selected place ids.0 is invalid."]
  }
}
```

---

## 6. Get All Places for Selection

**Endpoint:** `GET /api/trip-planning/places`

**Description:** Get a paginated list of all places with optional filters. Use this to show users places they can add to their trip.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| per_page | Integer | ❌ No | Number of places per page (default: 20) | 20 |
| page | Integer | ❌ No | Page number (default: 1) | 1 |
| category_id | Integer | ❌ No | Filter by category ID | 1 |
| province_id | Integer | ❌ No | Filter by province ID | 2 |
| search | String | ❌ No | Search by name or description | "temple" |
| min_rating | Decimal | ❌ No | Filter by minimum rating | 4.0 |
| entry_free | Boolean | ❌ No | Filter by entry type (1=free, 0=paid) | 1 |

### Flutter Example
```dart
Future<Map<String, dynamic>> getPlacesForSelection({
  int page = 1,
  int perPage = 20,
  int? categoryId,
  int? provinceId,
  String? search,
  double? minRating,
  bool? entryFree,
}) async {
  final queryParams = <String, String>{
    'page': page.toString(),
    'per_page': perPage.toString(),
  };
  
  if (categoryId != null) queryParams['category_id'] = categoryId.toString();
  if (provinceId != null) queryParams['province_id'] = provinceId.toString();
  if (search != null && search.isNotEmpty) queryParams['search'] = search;
  if (minRating != null) queryParams['min_rating'] = minRating.toString();
  if (entryFree != null) queryParams['entry_free'] = entryFree ? '1' : '0';
  
  final uri = Uri.parse('$baseUrl/trip-planning/places')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}

// Usage:
final places = await getPlacesForSelection(
  page: 1,
  perPage: 20,
  categoryId: 1,
  minRating: 4.0,
  search: 'temple',
);
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "placeID": 1,
      "name": "Angkor Wat",
      "description": "Ancient temple complex...",
      "category_id": 1,
      "category_name": "Historical Sites",
      "google_maps_link": "https://maps.google.com/...",
      "ratings": 4.8,
      "reviews_count": 1500,
      "images_url": ["url1", "url2"],
      "entry_free": false,
      "province_id": 1,
      "province_categoryName": "Siem Reap",
      "latitude": 13.412469,
      "longitude": 103.866986
    }
    // ... more places
  ],
  "pagination": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5,
    "from": 1,
    "to": 20
  }
}
```

---

## 7. Get Place Details

**Endpoint:** `GET /api/trip-planning/places/{placeId}`

**Description:** Get detailed information about a specific place.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| placeId | Integer | ✅ Yes | The ID of the place |

### Flutter Example
```dart
Future<Map<String, dynamic>> getPlaceDetails(int placeId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip-planning/places/$placeId'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "placeID": 1,
    "name": "Angkor Wat",
    "description": "Ancient temple complex and UNESCO World Heritage Site...",
    "category_id": 1,
    "category_name": "Historical Sites",
    "category_description": "Historical and cultural heritage sites",
    "google_maps_link": "https://maps.google.com/?q=13.412469,103.866986",
    "ratings": 4.8,
    "reviews_count": 1500,
    "images_url": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "image_public_ids": ["public_id_1", "public_id_2"],
    "entry_free": false,
    "operating_hours": {
      "monday": "5:00 AM - 6:00 PM",
      "tuesday": "5:00 AM - 6:00 PM",
      "wednesday": "5:00 AM - 6:00 PM"
    },
    "best_season_to_visit": "Winter",
    "province_id": 1,
    "province_categoryName": "Siem Reap",
    "latitude": 13.412469,
    "longitude": 103.866986,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-10-15T10:30:00.000000Z"
  }
}
```

---

## 8. Get Popular Places

**Endpoint:** `GET /api/trip-planning/places/popular/list`

**Description:** Get a list of popular/highly-rated places for quick recommendations.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| limit | Integer | ❌ No | Number of places to return (default: 10) | 10 |

### Flutter Example
```dart
Future<Map<String, dynamic>> getPopularPlaces({int limit = 10}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/trip-planning/places/popular/list?limit=$limit'),
    headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}

// Usage:
final popularPlaces = await getPopularPlaces(limit: 10);
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "placeID": 1,
      "name": "Angkor Wat",
      "description": "Ancient temple complex...",
      "category_id": 1,
      "category_name": "Historical Sites",
      "google_maps_link": "https://maps.google.com/...",
      "ratings": 4.9,
      "reviews_count": 2500,
      "images_url": ["url1", "url2"],
      "entry_free": false,
      "province_id": 1,
      "province_categoryName": "Siem Reap"
    }
    // ... more places
  ]
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```
**Reason:** Missing or invalid Bearer token.

### 404 Not Found
```json
{
  "success": false,
  "message": "Trip not found" // or "Trip day not found" or "Place not found"
}
```
**Reason:** The requested resource doesn't exist or doesn't belong to the user.

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message here"]
  }
}
```
**Reason:** Invalid input data.

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to create trip", // or other action
  "error": "Detailed error message"
}
```
**Reason:** Server-side error occurred.

---

## Complete Flutter Service Class Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class TripApiService {
  final String baseUrl = 'http://127.0.0.1:8000/api';
  final String token;

  TripApiService(this.token);

  Map<String, String> get _headers => {
    'Authorization': 'Bearer $token',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // 1. Create Trip
  Future<Map<String, dynamic>> createTrip({
    required String tripName,
    required String startDate,
    required String endDate,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/trips'),
      headers: _headers,
      body: jsonEncode({
        'trip_name': tripName,
        'start_date': startDate,
        'end_date': endDate,
      }),
    );
    return jsonDecode(response.body);
  }

  // 2. Get All Trips
  Future<Map<String, dynamic>> getAllTrips() async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  // 3. Get Trip Details
  Future<Map<String, dynamic>> getTripDetails(int tripId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips/$tripId'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  // 4. Get Trip Day Places
  Future<Map<String, dynamic>> getTripDayPlaces(int tripDayId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip-days/$tripDayId/places'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  // 5. Add Places to Trip Day
  Future<Map<String, dynamic>> addPlacesToTripDay({
    required int tripDayId,
    required List<int> placeIds,
    List<String>? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/trip-days/$tripDayId/places'),
      headers: _headers,
      body: jsonEncode({
        'place_ids': placeIds,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      }),
    );
    return jsonDecode(response.body);
  }

  // 6. Get Places for Selection
  Future<Map<String, dynamic>> getPlacesForSelection({
    int page = 1,
    int perPage = 20,
    int? categoryId,
    int? provinceId,
    String? search,
    double? minRating,
    bool? entryFree,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'per_page': perPage.toString(),
    };
    
    if (categoryId != null) queryParams['category_id'] = categoryId.toString();
    if (provinceId != null) queryParams['province_id'] = provinceId.toString();
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (minRating != null) queryParams['min_rating'] = minRating.toString();
    if (entryFree != null) queryParams['entry_free'] = entryFree ? '1' : '0';
    
    final uri = Uri.parse('$baseUrl/trip-planning/places')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(uri, headers: _headers);
    return jsonDecode(response.body);
  }

  // 7. Get Place Details
  Future<Map<String, dynamic>> getPlaceDetails(int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip-planning/places/$placeId'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  // 8. Get Popular Places
  Future<Map<String, dynamic>> getPopularPlaces({int limit = 10}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trip-planning/places/popular/list?limit=$limit'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }
}

// Usage Example:
void main() async {
  final service = TripApiService('your_token_here');
  
  // Create a trip
  final newTrip = await service.createTrip(
    tripName: 'My Summer Vacation',
    startDate: '2025-10-20',
    endDate: '2025-10-25',
  );
  
  print('Trip created: ${newTrip['data']['trip']['trip_id']}');
  
  // Get all trips
  final trips = await service.getAllTrips();
  print('Total trips: ${trips['data'].length}');
  
  // Get trip day places
  final places = await service.getTripDayPlaces(1);
  print('Places for day 1: ${places['data']['total_places']}');
}
```

---

## Important Notes for Flutter Developers

### 1. **Date Format**
- Always use `YYYY-MM-DD` format for dates
- Example: `2025-10-20`
- Use `DateFormat('yyyy-MM-dd').format(DateTime.now())` to format dates

### 2. **Authentication Token**
- Store token securely (use `flutter_secure_storage` package)
- Include in every request header as `Bearer YOUR_TOKEN`
- Handle token expiration and refresh

### 3. **Error Handling**
```dart
try {
  final result = await service.createTrip(...);
  if (result['success'] == true) {
    // Handle success
  } else {
    // Handle API error
    print(result['message']);
  }
} catch (e) {
  // Handle network error
  print('Network error: $e');
}
```

### 4. **Image URLs**
- `images_url` field is a JSON array of strings
- Parse it as `List<String>` in Flutter
- Example: `List<String>.from(place['images_url'] ?? [])`

### 5. **JSON Fields**
- Some fields like `operating_hours` and `images_url` are stored as JSON
- Parse them appropriately in Flutter models

### 6. **Pagination**
- Use pagination metadata to implement infinite scroll or pagination
- `current_page`, `last_page`, `total` are provided

### 7. **Tab Bar Implementation**
```dart
// Example TabBar with trip days
TabBarView(
  controller: _tabController,
  children: tripDays.map((day) {
    return FutureBuilder(
      future: service.getTripDayPlaces(day.tripDayId),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          final places = snapshot.data['data']['places'];
          return ListView.builder(
            itemCount: places.length,
            itemBuilder: (context, index) {
              return PlaceCard(place: places[index]);
            },
          );
        }
        return CircularProgressIndicator();
      },
    );
  }).toList(),
)
```

---

## Testing with Postman

Import the provided Postman collection: `trip_postman_collection.json`

**Steps:**
1. Set `baseUrl` variable to your API URL
2. Login and get token
3. Set `token` variable with your Bearer token
4. Test each endpoint

---

## Support

For issues or questions, contact the backend team or refer to the codebase documentation.
