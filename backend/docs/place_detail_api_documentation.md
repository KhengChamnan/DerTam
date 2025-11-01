# Place Detail API Documentation

## Overview
This API provides detailed information about a specific place, along with nearby hotels and restaurants based on geographical proximity using the Haversine formula.

**Base URL:** `http://127.0.0.1:8000/api`

**Authentication:** Not required (Public endpoints)

---

## Endpoints

### 1. Get Place Details with Nearby Hotels & Restaurants

**Endpoint:** `GET /api/places/{placeId}/details`

**Description:** Get complete details about a specific place, including nearby restaurants and hotels within a 10km radius.

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| placeId | Integer | ✅ Yes | The ID of the place |

#### Example Request
```
GET /api/places/5/details
```

#### Flutter Example
```dart
Future<Map<String, dynamic>> getPlaceDetails(int placeId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/places/$placeId/details'),
    headers: {
      'Accept': 'application/json',
    },
  );
  
  return jsonDecode(response.body);
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "place": {
      "placeID": 5,
      "name": "Angkor Wat",
      "description": "Ancient temple complex and UNESCO World Heritage Site...",
      "category_id": 1,
      "google_maps_link": "https://maps.google.com/?q=13.412469,103.866986",
      "ratings": 4.8,
      "reviews_count": 1500,
      "images_url": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "image_public_ids": ["public_id_1", "public_id_2"],
      "entry_free": false,
      "operating_hours": {
        "monday": "5:00 AM - 6:00 PM",
        "tuesday": "5:00 AM - 6:00 PM",
        "wednesday": "5:00 AM - 6:00 PM",
        "thursday": "5:00 AM - 6:00 PM",
        "friday": "5:00 AM - 6:00 PM",
        "saturday": "5:00 AM - 6:00 PM",
        "sunday": "5:00 AM - 6:00 PM"
      },
      "best_season_to_visit": "Winter",
      "province_id": 1,
      "latitude": 13.412469,
      "longitude": 103.866986,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-10-15T10:30:00.000000Z",
      "category_name": "Historical Sites",
      "category_description": "Historical and cultural heritage sites",
      "province_categoryName": "Siem Reap",
      "province_description": "Siem Reap Province"
    },
    "nearby": {
      "restaurants": [
        {
          "placeID": 12,
          "name": "Traditional Khmer Restaurant",
          "description": "Authentic Cambodian cuisine...",
          "category_id": 2,
          "category_name": "Restaurants",
          "google_maps_link": "https://maps.google.com/...",
          "ratings": 4.5,
          "reviews_count": 320,
          "images_url": ["url1", "url2"],
          "entry_free": false,
          "operating_hours": {...},
          "province_id": 1,
          "province_categoryName": "Siem Reap",
          "latitude": 13.415000,
          "longitude": 103.870000,
          "distance": 0.85,
          "distance_text": "0.85 km away"
        },
        {
          "placeID": 15,
          "name": "Royal Palace Restaurant",
          "description": "Fine dining with traditional performances...",
          "category_id": 2,
          "category_name": "Restaurants",
          "ratings": 4.7,
          "reviews_count": 580,
          "distance": 1.2,
          "distance_text": "1.2 km away"
        }
        // ... up to 5 restaurants
      ],
      "hotels": [
        {
          "placeID": 25,
          "name": "Angkor Heritage Hotel",
          "description": "Luxury hotel with temple views...",
          "category_id": 3,
          "category_name": "Hotels",
          "google_maps_link": "https://maps.google.com/...",
          "ratings": 4.6,
          "reviews_count": 890,
          "images_url": ["url1", "url2"],
          "entry_free": false,
          "operating_hours": {...},
          "province_id": 1,
          "province_categoryName": "Siem Reap",
          "latitude": 13.410000,
          "longitude": 103.865000,
          "distance": 0.35,
          "distance_text": "0.35 km away"
        }
        // ... up to 5 hotels
      ]
    }
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Place not found"
}
```

#### Notes
- **Nearby Radius:** 10 km (hardcoded)
- **Restaurants:** category_id = 2
- **Hotels:** category_id = 3
- **Limit:** Maximum 5 results per category
- **Sorting:** By distance (closest first), then by rating (highest first)
- **Distance Calculation:** Uses Haversine formula for accurate geographical distance

---

### 2. Get Nearby Places by Category (Custom)

**Endpoint:** `GET /api/places/{placeId}/nearby`

**Description:** Get nearby places of a specific category with customizable radius and limit.

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| placeId | Integer | ✅ Yes | The reference place ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| category_id | Integer | ✅ Yes | - | Category ID to filter (1=Attractions, 2=Restaurants, 3=Hotels, etc.) |
| radius | Float | ❌ No | 10 | Search radius in kilometers |
| limit | Integer | ❌ No | 10 | Maximum number of results |

#### Example Requests

**Get nearby attractions within 5km:**
```
GET /api/places/5/nearby?category_id=1&radius=5&limit=10
```

**Get nearby restaurants within 2km:**
```
GET /api/places/5/nearby?category_id=2&radius=2&limit=5
```

**Get nearby hotels within 15km:**
```
GET /api/places/5/nearby?category_id=3&radius=15&limit=20
```

#### Flutter Example
```dart
Future<Map<String, dynamic>> getNearbyPlaces({
  required int placeId,
  required int categoryId,
  double? radius,
  int? limit,
}) async {
  final queryParams = <String, String>{
    'category_id': categoryId.toString(),
  };
  
  if (radius != null) queryParams['radius'] = radius.toString();
  if (limit != null) queryParams['limit'] = limit.toString();
  
  final uri = Uri.parse('$baseUrl/places/$placeId/nearby')
      .replace(queryParameters: queryParams);
  
  final response = await http.get(
    uri,
    headers: {'Accept': 'application/json'},
  );
  
  return jsonDecode(response.body);
}

// Usage:
// Get restaurants within 3km
final restaurants = await getNearbyPlaces(
  placeId: 5,
  categoryId: 2,
  radius: 3.0,
  limit: 10,
);

// Get hotels within 10km
final hotels = await getNearbyPlaces(
  placeId: 5,
  categoryId: 3,
  radius: 10.0,
);
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "reference_place_id": 5,
    "category_id": 2,
    "radius_km": 5,
    "results": [
      {
        "placeID": 12,
        "name": "Traditional Khmer Restaurant",
        "description": "Authentic Cambodian cuisine...",
        "category_id": 2,
        "category_name": "Restaurants",
        "google_maps_link": "https://maps.google.com/...",
        "ratings": 4.5,
        "reviews_count": 320,
        "images_url": ["url1", "url2"],
        "entry_free": false,
        "operating_hours": {...},
        "province_id": 1,
        "province_categoryName": "Siem Reap",
        "latitude": 13.415000,
        "longitude": 103.870000,
        "distance": 0.85,
        "distance_text": "0.85 km away"
      }
      // ... more results
    ],
    "total_found": 8
  }
}
```

#### Error Responses

**404 - Place Not Found:**
```json
{
  "success": false,
  "message": "Place not found"
}
```

**400 - Missing Coordinates:**
```json
{
  "success": false,
  "message": "Place coordinates not available"
}
```

**422 - Missing Category:**
```json
{
  "success": false,
  "message": "category_id parameter is required"
}
```

---

## Category IDs Reference

| Category ID | Category Name | Description |
|-------------|---------------|-------------|
| 1 | Attractions | Historical sites, temples, monuments, tourist attractions |
| 2 | Restaurants | Dining establishments, cafes, food courts |
| 3 | Hotels | Hotels, resorts, guesthouses, accommodations |
| 4+ | Other | Custom categories as defined in your database |

---

## Distance Calculation

### Haversine Formula

The API uses the Haversine formula to calculate the great-circle distance between two points on Earth:

```
distance = 2 * R * arcsin(√(sin²((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin²((lon2 - lon1)/2)))
```

Where:
- **R** = Earth's radius (6371 km)
- **lat1, lon1** = Coordinates of reference place
- **lat2, lon2** = Coordinates of target place

### Accuracy
- **Unit:** Kilometers
- **Precision:** 2 decimal places (e.g., 1.25 km)
- **Range:** Suitable for distances up to 100 km

---

## Complete Flutter Service Class

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class PlaceDetailService {
  final String baseUrl = 'http://127.0.0.1:8000/api';

  // Get place details with nearby hotels and restaurants
  Future<Map<String, dynamic>> getPlaceDetails(int placeId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/places/$placeId/details'),
      headers: {'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load place details');
    }
  }

  // Get nearby places with custom filters
  Future<Map<String, dynamic>> getNearbyPlaces({
    required int placeId,
    required int categoryId,
    double? radius,
    int? limit,
  }) async {
    final queryParams = <String, String>{
      'category_id': categoryId.toString(),
    };
    
    if (radius != null) queryParams['radius'] = radius.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    
    final uri = Uri.parse('$baseUrl/places/$placeId/nearby')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(
      uri,
      headers: {'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load nearby places');
    }
  }

  // Get only nearby restaurants
  Future<List<dynamic>> getNearbyRestaurants(int placeId, {double radius = 5.0}) async {
    final result = await getNearbyPlaces(
      placeId: placeId,
      categoryId: 2,
      radius: radius,
      limit: 10,
    );
    return result['data']['results'];
  }

  // Get only nearby hotels
  Future<List<dynamic>> getNearbyHotels(int placeId, {double radius = 10.0}) async {
    final result = await getNearbyPlaces(
      placeId: placeId,
      categoryId: 3,
      radius: radius,
      limit: 10,
    );
    return result['data']['results'];
  }
}

// Usage Example:
void main() async {
  final service = PlaceDetailService();
  
  try {
    // Get place details with default nearby (hotels & restaurants)
    final placeDetails = await service.getPlaceDetails(5);
    print('Place: ${placeDetails['data']['place']['name']}');
    print('Nearby Restaurants: ${placeDetails['data']['nearby']['restaurants'].length}');
    print('Nearby Hotels: ${placeDetails['data']['nearby']['hotels'].length}');
    
    // Get custom nearby restaurants within 3km
    final nearbyRestaurants = await service.getNearbyRestaurants(5, radius: 3.0);
    print('Restaurants within 3km: ${nearbyRestaurants.length}');
    
    // Get custom nearby places (e.g., attractions)
    final nearbyAttractions = await service.getNearbyPlaces(
      placeId: 5,
      categoryId: 1,
      radius: 5.0,
      limit: 5,
    );
    print('Nearby Attractions: ${nearbyAttractions['data']['total_found']}');
    
  } catch (e) {
    print('Error: $e');
  }
}
```

---

## UI Implementation Example

### Place Detail Screen with Nearby Section

```dart
class PlaceDetailScreen extends StatefulWidget {
  final int placeId;
  
  const PlaceDetailScreen({required this.placeId});
  
  @override
  _PlaceDetailScreenState createState() => _PlaceDetailScreenState();
}

class _PlaceDetailScreenState extends State<PlaceDetailScreen> {
  final PlaceDetailService _service = PlaceDetailService();
  bool _isLoading = true;
  Map<String, dynamic>? _placeData;
  
  @override
  void initState() {
    super.initState();
    _loadPlaceDetails();
  }
  
  Future<void> _loadPlaceDetails() async {
    try {
      final data = await _service.getPlaceDetails(widget.placeId);
      setState(() {
        _placeData = data['data'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Show error message
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    final place = _placeData?['place'];
    final nearby = _placeData?['nearby'];
    
    return Scaffold(
      appBar: AppBar(title: Text(place['name'])),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Place Images
            ImageCarousel(images: place['images_url']),
            
            // Place Info
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(place['name'], style: Theme.of(context).textTheme.headlineMedium),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber),
                      Text('${place['ratings']} (${place['reviews_count']} reviews)'),
                    ],
                  ),
                  SizedBox(height: 16),
                  Text(place['description']),
                  
                  SizedBox(height: 24),
                  
                  // Nearby Restaurants Section
                  Text('Nearby Restaurants', style: Theme.of(context).textTheme.titleLarge),
                  SizedBox(height: 8),
                  SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: nearby['restaurants'].length,
                      itemBuilder: (context, index) {
                        final restaurant = nearby['restaurants'][index];
                        return NearbyPlaceCard(place: restaurant);
                      },
                    ),
                  ),
                  
                  SizedBox(height: 24),
                  
                  // Nearby Hotels Section
                  Text('Nearby Hotels', style: Theme.of(context).textTheme.titleLarge),
                  SizedBox(height: 8),
                  SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: nearby['hotels'].length,
                      itemBuilder: (context, index) {
                        final hotel = nearby['hotels'][index];
                        return NearbyPlaceCard(place: hotel);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Nearby Place Card Widget
class NearbyPlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;
  
  const NearbyPlaceCard({required this.place});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      margin: EdgeInsets.only(right: 16),
      child: Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Image.network(
              place['images_url'][0],
              height: 100,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
            Padding(
              padding: EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    place['name'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    place['distance_text'],
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      Text('${place['ratings']}', style: TextStyle(fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Important Notes

### 1. **Coordinates Required**
- Places must have valid `latitude` and `longitude` values
- Places without coordinates will not appear in nearby results

### 2. **Performance**
- Distance calculation is done in the database query
- Efficient for up to ~1000 places in the database
- For very large datasets (>10,000 places), consider using spatial indexes

### 3. **Accuracy**
- Haversine formula provides accuracy within ~0.5% for distances up to 100km
- Does not account for roads or actual travel distance
- Gives "as the crow flies" distance

### 4. **Category IDs**
- **2** = Restaurants (fixed)
- **3** = Hotels (fixed)
- Verify these match your database schema

### 5. **Radius Limits**
- Recommended: 1-50 km
- Default: 10 km
- Maximum: Not enforced (but performance may degrade beyond 100 km)

---

## Testing

### Postman Collection

Add these to your Postman collection:

**Request 1: Get Place Details**
```
GET {{baseUrl}}/api/places/5/details
```

**Request 2: Get Nearby Restaurants**
```
GET {{baseUrl}}/api/places/5/nearby?category_id=2&radius=5&limit=10
```

**Request 3: Get Nearby Hotels**
```
GET {{baseUrl}}/api/places/5/nearby?category_id=3&radius=10&limit=5
```

---

## Support

For issues or questions about this API, refer to the codebase or contact the backend development team.
