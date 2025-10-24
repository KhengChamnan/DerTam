import 'dart:convert';
import 'package:mobile_frontend/data/dto/category_dto.dart';
import 'package:mobile_frontend/data/dto/place_dto.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/place_repository.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/place/place_category.dart';
import 'package:mobile_frontend/models/place/place_deatail.dart';

class LaravelPlaceApiRepository implements PlaceRepository {
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  @override
  Future<List<PlaceCategory>> getCategory() async {
    try {
      final response = await FetchingData.getDate(
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
      final response = await FetchingData.getDate(
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
      // Construct the endpoint with the place ID
      final endpoint = '/api/places/$placeId/details';
      final response = await FetchingData.getDate(endpoint, _baseHeaders);
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = json.decode(response.body);
        // Check if the response has a 'data' key (common API pattern)
        final dataToProcess = jsonData.containsKey('data')
            ? jsonData['data']
            : jsonData;

        final place = PlaceDetailData.fromJson(dataToProcess);
        return place;
      } else {
        throw Exception('Failed to load place details: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Place>> getUpcomingEvents() async {
    try {
      final response = await FetchingData.getDate(
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
