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
  }) async {
    final url = Uri.parse('$baseUrl/api/trips/$tripId/days/$day/optimize');

    final headers = <String, String>{'Content-Type': 'application/json'};

    if (authToken != null && authToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }

    print('=== RouteService.fetchRoute DEBUG ===');
    print('URL: $url');
    print('Headers: $headers');
    
    final response = await http.post(url, headers: headers);

    print('Response Status: ${response.statusCode}');
    print('Response Body: ${response.body}');

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Parsed Data: $data');
      
      final route = data['route'] as List;
      print('Route Points Count: ${route.length}');

      return route
          .map(
            (stop) => RoutePoint(
              id: stop['place']['id'],
              name: stop['place']['name'],
              latLng: LatLng(
                stop['place']['latitude'],
                stop['place']['longitude'],
              ),
              order: stop['order'],
            ),
          )
          .toList();
    } else {
      print('Error: Status Code ${response.statusCode}');
      throw Exception('Failed to load route: ${response.statusCode}');
    }
  }
}

/// Model class for a route point
class RoutePoint {
  final String id;
  final String name;
  final LatLng latLng;
  final int order;

  RoutePoint({
    required this.id,
    required this.name,
    required this.latLng,
    required this.order,
  });
}
