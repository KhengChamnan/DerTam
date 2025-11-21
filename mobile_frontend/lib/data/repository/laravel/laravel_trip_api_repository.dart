import 'dart:convert';

import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/trip_repsitory.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/trips/create_trip_response.dart';
import 'package:mobile_frontend/models/trips/confirm_trip_response.dart';

class LaravelTripApiRepository implements TripRepository {
  late LaravelAuthApiRepository repository;
  LaravelTripApiRepository(this.repository);
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  Map<String, String> _getAuthHeaders(String token) => {
    ..._baseHeaders,
    'Authorization': 'Bearer $token',
  };

  @override
  Future<TripResponse> createTrip(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  ) async {
    print('\n🚀 [DEBUG] createTrip called');
    print('📝 [DEBUG] Trip Name: $tripName');
    print('📅 [DEBUG] Start Date: $startDate');
    print('📅 [DEBUG] End Date: $endDate');

    try {
      final token = await repository.getToken();
      print(
        '🔑 [DEBUG] Token retrieved: ${token != null ? "Yes (${token.substring(0, 20)}...)" : "No"}',
      );

      if (token == null) {
        print('❌ [DEBUG] User is not authenticated');
        throw Exception('User is not authenticated');
      }

      final body = {
        'trip_name': tripName,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate.toIso8601String(),
      };
      print('📦 [DEBUG] Request body: ${json.encode(body)}');

      final header = _getAuthHeaders(token);
      print('📋 [DEBUG] Request headers: ${header.keys.join(", ")}');
      print('🌐 [DEBUG] Endpoint: ${ApiEndpoint.createTrip}');

      final response = await FetchingData.postData(
        ApiEndpoint.createTrip,
        body,
        header,
      );

      print('📡 [DEBUG] Response status code: ${response.statusCode}');
      print('📄 [DEBUG] Response body: ${response.body}');

      if (response.statusCode == 201) {
        final jsonResponse = response.body;
        final trip = TripResponse.fromJson(json.decode(jsonResponse));
        print('✅ [DEBUG] Trip created successfully: ${trip.trip?.tripName}');
        return trip;
      } else {
        print('❌ [DEBUG] Failed with status: ${response.statusCode}');
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to create trip: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 [DEBUG] Exception in createTrip: $e');
      print('📚 [DEBUG] Stack trace: ${StackTrace.current}');
      rethrow;
    }
  }

  @override
  Future<ConfirmTripResponse> confirmTrip(
    String tripId,
    Map<String, List<int>> dayPlaceIds,
  ) async {
    print('\n🚀 [DEBUG] confirmTrip called');
    print('🆔 [DEBUG] Trip ID: $tripId');
    print('📦 [DEBUG] Day Place IDs: $dayPlaceIds');

    try {
      final token = await repository.getToken();
      print(
        '🔑 [DEBUG] Token retrieved: ${token != null ? "Yes (${token.substring(0, 20)}...)" : "No"}',
      );

      if (token == null) {
        print('❌ [DEBUG] User is not authenticated');
        throw Exception('User is not authenticated');
      }

      // Build the body structure according to API specification
      // {"day1": {"place_ids": [4,5]}, "day2": {"place_ids": [6,7]}, ...}
      final body = <String, Map<String, List<int>>>{};
      dayPlaceIds.forEach((day, placeIds) {
        body[day] = {'place_ids': placeIds};
      });

      print('📦 [DEBUG] Request body: ${json.encode(body)}');

      final header = _getAuthHeaders(token);
      print('📋 [DEBUG] Request headers: ${header.keys.join(", ")}');

      final endpoint = '${ApiEndpoint.addPlaceToTripDay}/$tripId';
      print('🌐 [DEBUG] Endpoint: $endpoint');

      final response = await FetchingData.postData(endpoint, body, header);

      print('📡 [DEBUG] Response status code: ${response.statusCode}');
      print('📄 [DEBUG] Response body: ${response.body}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        final jsonResponse = response.body;
        final confirmResponse = ConfirmTripResponse.fromJson(
          json.decode(jsonResponse),
        );
        print(
          '✅ [DEBUG] Trip confirmed successfully for trip ID: ${confirmResponse.data.tripId}',
        );
        return confirmResponse;
      } else {
        print('❌ [DEBUG] Failed with status: ${response.statusCode}');
        print('❌ [DEBUG] Error response body: ${response.body}');
        throw Exception('Failed to confirm trip: ${response.statusCode}');
      }
    } catch (e) {
      print('💥 [DEBUG] Exception in confirmTrip: $e');
      print('📚 [DEBUG] Stack trace: ${StackTrace.current}');
      rethrow;
    }
  }

  @override
  Future<ConfirmTripResponse> getTripDetail(String tripId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('Token is not found!');
      }
      final header = _getAuthHeaders(token);
      final getTripDetailResponse = await FetchingData.getData(
        '${ApiEndpoint.getTripDetail}/$tripId',
        header,
      );
      print(
        '📡 [DEBUG] Response status code: ${getTripDetailResponse.statusCode}',
      );
      print('📄 [DEBUG] Response body: ${getTripDetailResponse.body}');
      if (getTripDetailResponse.statusCode == 200) {
        final jsonResponse = getTripDetailResponse.body;
        final tripDetail = ConfirmTripResponse.fromJson(
          json.decode(jsonResponse),
        );
        return tripDetail;
      } else {
        print(
          '❌ [DEBUG] Failed with status: ${getTripDetailResponse.statusCode}',
        );
        print('❌ [DEBUG] Error response body: ${getTripDetailResponse.body}');
        throw Exception(
          'Failed to confirm trip: ${getTripDetailResponse.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }
}
