import 'dart:convert';
import 'package:mobile_frontend/models/place/place.dart';

/// Data Transfer Object for Place model
class PlaceDto {
  /// Convert API/Database JSON to Place model
  static Place fromJson(Map<String, dynamic> json) {
    try {
      return Place(
        placeId: json['placeID']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        categoryId: int.tryParse(json['category_id']?.toString() ?? '0') ?? 0,
        googleMapsLink: json['google_maps_link']?.toString() ?? '',
        ratings: double.tryParse(json['ratings']?.toString() ?? '0.0') ?? 0.0,
        reviewsCount: int.tryParse(json['reviews_count']?.toString() ?? '0') ?? 0,
        imagesUrl: json['image_url']?.toString() ?? '',
        imagePublicIds: json['image_public_ids']?.toString() ?? '',
        entryFree: json['entry_free'] == 1 || json['entry_free'] == true,
        operatingHours: _parseJsonMap(json['operating_hours']),
        bestSeasonToVisit: json['best_season_to_visit']?.toString() ?? 'Summer',
        provinceId: int.tryParse(json['province_id']?.toString() ?? '0') ?? 0,
        latitude: double.tryParse(json['latitude']?.toString() ?? '0.0') ?? 0.0,
        longitude: double.tryParse(json['longitude']?.toString() ?? '0.0') ?? 0.0,
        createdAt: _parseDateTime(json['created_at']),
        updatedAt: _parseDateTime(json['updated_at']),
        locationName: json['location']?.toString() ?? '',
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Convert Place model to API/Database JSON format
  static Map<String, dynamic> toJson(Place place) {
    try {
      return {
        'placeID': place.placeId,
        'name': place.name,
        'description': place.description,
        'category_id': place.categoryId,
        'google_maps_link': place.googleMapsLink,
        'ratings': place.ratings,
        'reviews_count': place.reviewsCount,
        'image_url': jsonEncode(place.imagesUrl),
        'image_public_ids': jsonEncode(place.imagePublicIds),
        'entry_free': place.entryFree ? 1 : 0,
        'operating_hours': jsonEncode(place.operatingHours),
        'best_season_to_visit': place.bestSeasonToVisit,
        'province_id': place.provinceId,
        'latitude': place.latitude,
        'longitude': place.longitude,
        'created_at': place.createdAt.toIso8601String(),
        'updated_at': place.updatedAt.toIso8601String(),
        'location': place.locationName,
      };
    } catch (e) {
      print('Error converting Place to JSON: $e');
      rethrow;
    }
  }

  static Map<String, dynamic> _parseJsonMap(dynamic value) {
    if (value == null) return {};
    
    if (value is String) {
      try {
        final decoded = jsonDecode(value);
        if (decoded is Map) {
          return Map<String, dynamic>.from(decoded);
        }
      } catch (e) {
        print('Error parsing JSON map: $e');
      }
    }
    
    if (value is Map) {
      return Map<String, dynamic>.from(value);
    }
    
    return {};
  }

  /// Parse date string to DateTime
  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (e) {
        print('Error parsing DateTime: $e');
      }
    }
    
    if (value is DateTime) {
      return value;
    }
    
    return DateTime.now();
  }
}
