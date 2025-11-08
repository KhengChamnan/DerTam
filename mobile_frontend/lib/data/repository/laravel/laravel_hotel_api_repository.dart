import 'dart:convert';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_booking_response.dart';
import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';

class LaravelHotelApiRepository extends HotelRepository {
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

  @override
  Future<List<HotelList>> getListHotel() async {
    try {
      final response = await FetchingData.getDate(
        ApiEndpoint.getListHotel,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        // Extract the 'data' array from the response
        final List<dynamic> dataList = jsonResponse['data'] ?? [];
        // Parse each item in the data array as HotelList
        final hotelList = dataList
            .map((item) => HotelList.fromJson(item as Map<String, dynamic>))
            .toList();

        return hotelList;
      } else {
        throw Exception('Failed to load hotel list: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> createBooking(
    String fullName,
    String age,
    String gender,
    String mobileNumber,
    String email,
    String idNumber,
    String idImage,
    DateTime checkinDate,
    DateTime checkoutDate,
    String paymentMethod,
    String roomId,
  ) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final body = {
        'full_name': fullName,
        'age': age,
        'gender': gender,
        'mobile': mobileNumber,
        'email': email,
        'id_number': idNumber,
        'id_image': idImage,
        'check_in': checkinDate.toIso8601String(),
        'check_out': checkoutDate.toIso8601String(),
        'payment_method': paymentMethod,
        'room_ids': roomId,
      };
      final response = await FetchingData.postHeader(
        ApiEndpoint.createBooking,
        headers,
        body,
      );
      if (response.statusCode == 200) {
        throw Exception('Booking successfully created: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<HotelBookingResponse>> getAllBooking() async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.getDate(
        ApiEndpoint.getAllBookings,
        headers,
      );
      if (response.statusCode == 200) {
        final List<dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse
            .map((item) => HotelBookingResponse.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load bookings: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<HotelBookingResponse> getBookingDetails(String bookingId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.getDate(
        '${ApiEndpoint.getSingleBookingById}/$bookingId',
        headers,
      );
      if (response.statusCode == 200) {
        return HotelBookingResponse.fromJson(json.decode(response.body));
      } else {
        throw Exception(
          'Failed to load booking details: ${response.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> cancelBooking(String bookingId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.postWithHeaderOnly(
        '/api/hotels/bookings/$bookingId/cancel',
        headers,
      );
      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        print('Hotel has been Canceled $responseBody');
      } else {
        throw Exception('Failed to cancel booking: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteBooking(String bookingId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.deleteData(
        '${ApiEndpoint.deleteBooking}/$bookingId',
        headers,
      );
      if (response.statusCode == 200) {
        final responseBody = json.decode(response.body);
        print('Hotel has been Deleted $responseBody');
      } else {
        throw Exception('Failed to delete booking: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
