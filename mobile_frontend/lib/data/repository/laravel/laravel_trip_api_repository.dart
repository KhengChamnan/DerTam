import 'dart:convert';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/trip_repsitory.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/trips/trips.dart';

class LaravelTripApiRepository implements TripRepository {
  late LaravelAuthApiRepository repository;
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  Map<String, String> _getAuthHeaders(String token) => {
    ..._baseHeaders,
    'Authorization': 'Bearer $token',
  };

  @override
  Future<void> createTrip(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  ) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final body = {
        'name': tripName,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate.toIso8601String(),
      };
      final header = _getAuthHeaders(token);
      final response = await FetchingData.postData(
        ApiEndpoint.createTrip,
        body,
        header,
      );
      if (response.statusCode == 200) {
        print('✅ Trip has been created successfully! ${response.body}');
      } else {
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to create trip: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> updateTrip(String tripId) async {
    // TODO: implement updateTrip
    throw UnimplementedError();
  }

  @override
  Future<void> removePlaceFromTrip(String placeId) async {
    // TODO: implement removePlaceFromTrip
    throw UnimplementedError();
  }

  @override
  Future<void> addPlaceToTrip(
    List<int> placeIds,
    String tripDayId, {
    List<String>? notes,
  }) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final body = {'place_ids': placeIds, 'notes': notes ?? []};
      final header = _getAuthHeaders(token);
      final response = await FetchingData.postData(
        '/api/trip-days/$tripDayId/places',
        body,
        header,
      );
      if (response.statusCode == 200) {
        print(
          '✅ Places have been added to trip successfully! ${response.body}',
        );
      } else {
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to add places to trip: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> cancelTrip(String tripId) async {
    // TODO: implement cancelTrip
    throw UnimplementedError();
  }

  @override
  Future<List<Trip>> getListOfTrip() async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final response = await FetchingData.getData(
        ApiEndpoint.getListOfTrips,
        _getAuthHeaders(token),
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final trips = jsonData.map((json) => Trip.fromJson(json)).toList();
        return trips;
      } else {
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to fetch trips: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Trip> getTripDetails(String tripId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final tripDetailResponse = await FetchingData.getData(
        '${ApiEndpoint.getTripDetails}/$tripId',
        _getAuthHeaders(token),
      );
      if (tripDetailResponse.statusCode == 200) {
        final trips = json
            .decode(tripDetailResponse.body)
            .map((json) => Trip.fromJson(json))
            .toList();
        return trips;
      } else {
        print('❌ [DEBUG] Error response body: ${tripDetailResponse.body}');
        throw Exception(
          'Failed to fetch trips: ${tripDetailResponse.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> confirmTrip(String tripId) async {
    // TODO: implement confirmTrip
    throw UnimplementedError();
  }
}
