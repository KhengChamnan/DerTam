import 'dart:convert';

import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_nearby.dart';

class LaravelHotelApiRepository extends HotelRepository {
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  @override
  Future<List<Hotel>> getHotels() async {
    try {
      final response = await FetchingData.getDate(
        ApiEndpoint.hotel,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final hotels = jsonData.map((json) => Hotel.fromJson(json)).toList();
        return hotels;
      } else {
        throw Exception('Failed to load hotels: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
