import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

class RouteService {
  final String baseUrl;

  RouteService({required this.baseUrl});

  /// Fetch route for a specific trip and day
  Future<List<RoutePoint>> fetchRoute(
    int tripId,
    int day, {
    String? authToken,
    double? startLatitude,
    double? startLongitude,
  }) async {
    final url = Uri.parse('$baseUrl/api/trips/$tripId/days/$day/optimize');

    final headers = <String, String>{'Content-Type': 'application/json'};

    if (authToken != null && authToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }

    // Build request body with starting location if provided
    Map<String, dynamic>? body;
    if (startLatitude != null && startLongitude != null) {
      body = {
        'starting_location': {
          'latitude': startLatitude,
          'longitude': startLongitude,
        },
      };
    }

    print('=== RouteService.fetchRoute DEBUG ===');
    print('URL: $url');
    print('Headers: $headers');
    print('Body: ${body != null ? jsonEncode(body) : 'No body'}');

    final response = await http.post(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );

    print('Response Status: ${response.statusCode}');
    print('Response Body: ${response.body}');

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Parsed Data: $data');

      // Parse response with new structure including starting_location
      final route = data['route'] as List;
      final totalPlaces = data['total_places'] ?? route.length;
      final totalDistance = data['total_distance'] ?? 0.0;
      final algorithm = data['algorithm'] ?? 'Unknown';
      final startingLocation = data['starting_location'];

      print('Day: ${data['day']}');
      print('Total Places: $totalPlaces');
      print('Total Distance: ${totalDistance}km');
      print('Algorithm: $algorithm');
      if (startingLocation != null) {
        print(
          'Starting Location: ${startingLocation['latitude']}, ${startingLocation['longitude']}',
        );
      }
      print('Route Points Count: ${route.length}');

      // Map route points from backend response
      final routePoints = route
          .map(
            (stop) => RoutePoint(
              id: stop['place']['id']?.toString() ?? '',
              name: stop['place']['name'] ?? 'Unknown',
              latLng: LatLng(
                stop['place']['latitude'],
                stop['place']['longitude'],
              ),
              order:
                  stop['order'] +
                  1, // Shift order to make room for user location
              distanceToNext: stop['distance_to_next']?.toDouble(),
            ),
          )
          .toList();

      // Add user's actual location as the first point if startLatitude/startLongitude were provided
      if (startLatitude != null && startLongitude != null) {
        routePoints.insert(
          0,
          RoutePoint(
            id: 'user_location',
            name: 'Your Location',
            latLng: LatLng(startLatitude, startLongitude),
            order: 0,
            distanceToNext: null,
          ),
        );
        print(
          'Added user GPS location as first route point: ($startLatitude, $startLongitude)',
        );
      }

      // Sort by order to ensure correct sequence
      routePoints.sort((a, b) => a.order.compareTo(b.order));

      print('Final route points:');
      for (var point in routePoints) {
        print(
          '  Order ${point.order}: ${point.name} at (${point.latLng.latitude}, ${point.latLng.longitude})',
        );
      }
      return routePoints;
    } else {
      print('Error: Status Code ${response.statusCode}');
      throw Exception('Failed to load route: ${response.statusCode}');
    }
  }

  /// Generate Google Maps directions URL
  /// Opens navigation from user's current location to destination
  static String getGoogleMapsDirectionsUrl({
    required double destinationLat,
    required double destinationLng,
    double? startLat,
    double? startLng,
  }) {
    // If start location is provided, use it; otherwise Google Maps will use current location
    final origin = startLat != null && startLng != null
        ? '$startLat,$startLng'
        : '';
    final destination = '$destinationLat,$destinationLng';

    // Google Maps URL format for directions
    if (origin.isNotEmpty) {
      return 'https://www.google.com/maps/dir/?api=1&origin=$origin&destination=$destination&travelmode=driving';
    } else {
      // When origin is not specified, Google Maps uses current location
      return 'https://www.google.com/maps/dir/?api=1&destination=$destination&travelmode=driving';
    }
  }
}

/// Model class for a route point
class RoutePoint {
  final String id;
  final String name;
  final LatLng latLng;
  final int order;
  final double? distanceToNext; // Distance to next point in kilometers

  RoutePoint({
    required this.id,
    required this.name,
    required this.latLng,
    required this.order,
    this.distanceToNext,
  });
}
