// ignore_for_file: avoid_print

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:google_maps_flutter/google_maps_flutter.dart';

class DirectionsService {
  final String apiKey = 'AIzaSyBAeKngtUoBtDDR6wSAV2SDn27YJIyeZ9o';

  Future<Map<String, dynamic>> getDirections({
    required LatLng origin,
    required LatLng destination,
  }) async {
    // Use the new Routes API instead of the older Directions API
    final String url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    
    // Create request body for the Routes API
    final Map<String, dynamic> requestBody = {
      "origin": {
        "location": {
          "latLng": {
            "latitude": origin.latitude,
            "longitude": origin.longitude
          }
        }
      },
      "destination": {
        "location": {
          "latLng": {
            "latitude": destination.latitude,
            "longitude": destination.longitude
          }
        }
      },
      "travelMode": "DRIVE",
      "routingPreference": "TRAFFIC_AWARE",
      "computeAlternativeRoutes": false,
      "routeModifiers": {
        "avoidTolls": false,
        "avoidHighways": false,
        "avoidFerries": false
      },
      "languageCode": "en-US",
      "units": "METRIC"
    };

    print("Calling Routes API: $url");
    
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        },
        body: jsonEncode(requestBody),
      );
      
      print("Response status code: ${response.statusCode}");
      print("Response body: ${response.body}");
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        if (data.containsKey('routes') && data['routes'].isNotEmpty) {
          final route = data['routes'][0];
          
          // Extract distance in meters and convert to km
          final int distanceMeters = route['distanceMeters'];
          final String distance = '${(distanceMeters / 1000).toStringAsFixed(1)} km';
          
          // Extract duration in seconds and format
          final String durationString = route['duration'];
          final String duration = _formatDuration(durationString);
          
          // Extract encoded polyline
          final String encodedPolyline = route['polyline']['encodedPolyline'];
          print("Received polyline points: Valid data");
          
          // Decode polyline to coordinates
          final List<LatLng> polylineCoordinates = _decodePolyline(encodedPolyline);
          print("Decoded ${polylineCoordinates.length} coordinates from polyline");
          
          if (polylineCoordinates.isEmpty) {
            print("Polyline decoded to empty list");
            throw Exception('Failed to decode polyline data');
          }
          
          return {
            'distance': distance,
            'duration': duration,
            'polylineCoordinates': polylineCoordinates,
          };
        } else {
          print("No routes found in response");
          throw Exception('No routes found in response');
        }
      } else {
        print("HTTP Error: ${response.statusCode} - ${response.body}");
        throw Exception('Network error: ${response.statusCode}');
      }
    } catch (e) {
      print("Exception during routes request: $e");
      rethrow; // Let the map screen handle the error
    }
  }
  
  // Helper method to format duration from "123456s" to "X hrs Y mins"
  String _formatDuration(String durationString) {
    // Remove the 's' at the end and parse to integer
    int seconds = int.parse(durationString.replaceAll('s', ''));
    int hours = seconds ~/ 3600;
    int minutes = (seconds % 3600) ~/ 60;
    
    if (hours > 0) {
      return '$hours hr ${minutes > 0 ? '$minutes min' : ''}';
    } else {
      return '$minutes min';
    }
  }

  List<LatLng> _decodePolyline(String encoded) {
    try {
      List<LatLng> polyline = [];
      int index = 0, len = encoded.length;
      int lat = 0, lng = 0;

      while (index < len) {
        int shift = 0, result = 0;
        int byte;
        do {
          byte = encoded.codeUnitAt(index++) - 63;
          result |= (byte & 0x1F) << shift;
          shift += 5;
        } while (byte >= 0x20);
        int deltaLat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        shift = 0;
        result = 0;
        do {
          byte = encoded.codeUnitAt(index++) - 63;
          result |= (byte & 0x1F) << shift;
          shift += 5;
        } while (byte >= 0x20);
        int deltaLng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += deltaLng;

        polyline.add(LatLng(lat / 1E5, lng / 1E5));
      }
      
      print("Successfully decoded polyline with ${polyline.length} points");
      return polyline;
    } catch (e) {
      print("Error decoding polyline: $e");
      return [];
    }
  }
}

