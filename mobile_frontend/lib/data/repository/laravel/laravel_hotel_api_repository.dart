import 'dart:convert';

import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/room.dart';

class LaravelHotelApiRepository extends HotelRepository {
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  @override
  Future<HotelDetail> getHotelDetails(String hotelId) async {
    try {
      print('🔍 [DEBUG] getHotelDetails called with hotelId: $hotelId');
      print('🔍 [DEBUG] API endpoint: ${ApiEndpoint.hotelDetails}/$hotelId');
      final response = await FetchingData.getDate(
        '${ApiEndpoint.hotelDetails}/$hotelId',
        _baseHeaders,
      );
      print('📊 [DEBUG] Response status code: ${response.statusCode}');
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        print('📦 [DEBUG] Raw JSON response:');
        print(json.encode(jsonResponse)); // Pretty print the JSON
        final jsonData = jsonResponse['data'];
        if (jsonData == null) {
          throw Exception('Response does not contain "data" field');
        }
        print(
          '📦 [DEBUG] Has property_id: ${jsonData.containsKey('property_id')}',
        );
        print('📦 [DEBUG] Has place: ${jsonData.containsKey('place')}');
        if (jsonData.containsKey('place')) {
          print('📦 [DEBUG] Place name: ${jsonData['place']['name']}');
        }
        final hotelDetailResponse = HotelDetail.fromJson(jsonData);
        print('✅ [DEBUG] Successfully parsed HotelDetail object');
        print('✅ [DEBUG] Parsed place name: ${hotelDetailResponse.place.name}');
        return hotelDetailResponse;
      } else {
        throw Exception('Failed to load hotel details: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Room> getRoomDetails(String roomId) async {
    try {
      final response = await FetchingData.getDate(
        '${ApiEndpoint.roomDetails}/$roomId',
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        final jsonData = jsonResponse['data'];
        if (jsonData == null) {
          throw Exception('Response does not contain "data" field');
        }
        return Room.fromJson(jsonData);
      } else {
        throw Exception('Failed to load room details: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
