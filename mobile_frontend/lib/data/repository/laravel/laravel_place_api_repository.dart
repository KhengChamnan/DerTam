import 'dart:convert';
import 'package:mobile_frontend/data/dto/category_dto.dart';
import 'package:mobile_frontend/data/dto/place_dto.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/place_repository.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/place/place_category.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';

class LaravelPlaceApiRepository implements PlaceRepository {
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  @override
  Future<List<PlaceCategory>> getCategory() async {
    try {
      final response = await FetchingData.getData(
        ApiEndpoint.categories,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final categories = jsonData
            .map((json) => CategoryDTO.fromJson(json))
            .toList();
        return categories;
      } else {
        throw Exception('Failed to load categories: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Place>> getRecommendedPlaces() async {
    try {
      final response = await FetchingData.getData(
        ApiEndpoint.recommendedPlaces,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final places = jsonData.map((json) => PlaceDto.fromJson(json)).toList();
        return places;
      } else {
        throw Exception(
          'Failed to load recommended places: ${response.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Place>> getPlacesByCategory(String categoryId) async {
    try {
      final param = {'category_id': categoryId};
      final response = await FetchingData.getDataPar(
        ApiEndpoint.placeBaseOnCategory,
        param,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final places = jsonData.map((json) => PlaceDto.fromJson(json)).toList();
        return places;
      } else {
        throw Exception('Failed to load places: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<PlaceDetailData> getPlaceDetails(String placeId) async {
    try {
      print('🔍 [DEBUG] getPlaceDetails called with placeId: $placeId');
      // Construct the endpoint with the place ID
      final endpoint = '/api/places/$placeId/details';
      print('🔍 [DEBUG] Endpoint: $endpoint');
      print('🔍 [DEBUG] Headers: $_baseHeaders');

      final response = await FetchingData.getData(endpoint, _baseHeaders);

      print('🔍 [DEBUG] Response status code: ${response.statusCode}');
      print('🔍 [DEBUG] Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        print('🔍 [DEBUG] Decoded JSON data: $jsonData');

        // Parse the complete response using PlaceDetailResponse
        final placeDetailResponse = PlaceDetailResponse.fromJson(jsonData);
        print('🔍 [DEBUG] Response success: ${placeDetailResponse.success}');

        if (!placeDetailResponse.success) {
          throw Exception('API returned success: false');
        }

        print(
          '🔍 [DEBUG] Successfully parsed PlaceDetailData: ${placeDetailResponse.data.toString()}',
        );
        return placeDetailResponse.data;
      } else {
        print('❌ [DEBUG] Failed with status code: ${response.statusCode}');
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to load place details: ${response.statusCode}');
      }
    } catch (e, stackTrace) {
      print('❌ [DEBUG] Exception caught in getPlaceDetails: $e');
      print('❌ [DEBUG] Stack trace: $stackTrace');
      rethrow;
    }
  }

  @override
  Future<List<Place>> getUpcomingEvents() async {
    try {
      final response = await FetchingData.getData(
        ApiEndpoint.upcomingEvents,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final places = jsonData.map((json) => PlaceDto.fromJson(json)).toList();
        return places;
      } else {
        throw Exception(
          'Failed to load recommended places: ${response.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Place>> searchPlaces(String query) {
    // TODO: implement searchPlaces
    throw UnimplementedError();
  }
}
