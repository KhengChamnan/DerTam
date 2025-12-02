import 'dart:convert';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/booking/hotel_booking_list_response.dart';
import 'package:mobile_frontend/models/booking/hotel_booking_request.dart';
import 'package:mobile_frontend/models/hotel/hotel_detail.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/models/hotel/search_room.dart';

class LaravelHotelApiRepository extends HotelRepository {
  final LaravelAuthApiRepository authRepository;
  LaravelHotelApiRepository(this.authRepository);

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
      print('🔍 [DEBUG] API endpoint: ${ApiEndpoint.hotelDetails}/$hotelId');
      final response = await FetchingData.getData(
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

        if (jsonData.containsKey('place')) {
          print('📦 [DEBUG] Place name: ${jsonData['place']['name']}');
        }
        final hotelDetailResponse = HotelDetail.fromJson(jsonData);
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
      final response = await FetchingData.getData(
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
      final response = await FetchingData.getData(
        ApiEndpoint.getListHotel,
        _baseHeaders,
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        final List<dynamic> dataList = jsonResponse['data'] ?? [];
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
  Future<HotelBookingResponse> createBooking(
    DateTime checkIn,
    DateTime checkOut,
    List<Room> bookingItems,
    String paymentOption,
  ) async {
    try {
      final token = await authRepository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final String formattedCheckIn =
          '${checkIn.year}-${checkIn.month.toString().padLeft(2, '0')}-${checkIn.day.toString().padLeft(2, '0')}';
      final String formattedCheckOut =
          '${checkOut.year}-${checkOut.month.toString().padLeft(2, '0')}-${checkOut.day.toString().padLeft(2, '0')}';
      final body = {
        'check_in': formattedCheckIn,
        'check_out': formattedCheckOut,
        'booking_items': bookingItems.map((room) {
          return {
            'room_property_id': room.roomPropertiesId,
            'quantity': 1,
            'unit_price': room.pricePerNight,
          };
        }).toList(),
        'payment_option': paymentOption,
        'returnDeeplink': 'myapp://payment',
      };

      // Debug: Print the request body
      print('🔍 [Booking Request] Endpoint: ${ApiEndpoint.hotelBooking}');
      print('🔍 [Booking Request] Body: ${json.encode(body)}');
      print('🔍 [Booking Request] Payment Option: $paymentOption');

      final response = await FetchingData.postHeader(
        ApiEndpoint.hotelBooking,
        headers,
        body,
      );

      // Debug: Print the response
      print('📊 [Booking Response] Status Code: ${response.statusCode}');
      print('📊 [Booking Response] Body: ${response.body}');

      // Handle success status codes: 200 (OK), 201 (Created), 422 (with success flag)
      if (response.statusCode == 200 ||
          response.statusCode == 201 ||
          response.statusCode == 422) {
        final jsonResponse = json.decode(response.body);

        // Check if the response indicates success
        if (jsonResponse['success'] == true && jsonResponse['data'] != null) {
          // Pass the entire response to fromJson, not just the data field
          final hotelBookingResponse = HotelBookingResponse.fromJson(
            jsonResponse,
          );
          print('✅ [Booking Success] Booking created successfully');
          return hotelBookingResponse;
        } else {
          // Extract validation errors if available
          final message = jsonResponse['message'] ?? 'Unknown error';
          final errors = jsonResponse['errors']; // Laravel validation errors

          print('❌ [Booking Error] Message: $message');
          if (errors != null) {
            print(
              '❌ [Booking Error] Validation Errors: ${json.encode(errors)}',
            );
          }

          throw Exception(
            'Booking failed: $message${errors != null ? '\nErrors: ${json.encode(errors)}' : ''}',
          );
        }
      } else {
        final errorBody = response.body;
        print('❌ [Booking Error] Status: ${response.statusCode}');
        print('❌ [Booking Error] Body: $errorBody');
        throw Exception(
          'Failed to create booking: ${response.statusCode} - $errorBody',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<BookingListResponse>> getAllHotelBooking() async {
    try {
      final token = await authRepository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.getData(
        ApiEndpoint.getAllBookings,
        headers,
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        return [BookingListResponse.fromJson(jsonResponse)];
      } else {
        throw Exception('Failed to load bookings: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BookingDetailResponse> getBookingDetails(String bookingId) async {
    try {
      final token = await authRepository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);

      // Replace the placeholder with the actual booking ID

      final response = await FetchingData.getData(
        '${ApiEndpoint.getBookingDetail}/$bookingId',
        headers,
      );

      print(
        '📊 [DEBUG] Booking detail response status: ${response.statusCode}',
      );
      print('📊 [DEBUG] Booking detail response body: ${response.body}');

      if (response.statusCode == 200) {
        return BookingDetailResponse.fromJson(json.decode(response.body));
      } else {
        throw Exception(
          'Failed to load booking details: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('❌ [ERROR] Error fetching booking details: $e');
      rethrow;
    }
  }

  @override
  Future<void> cancelHotelBooking(String bookingId) async {
    try {
      final token = await authRepository.getToken();
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
  Future<SearchRoomResponse> searchAvailableRooms(
    DateTime checkIn,
    DateTime checkOut,
    int guests,
    int nights,
  ) async {
    try {
      final token = await authRepository.getToken();
      if (token == null) {
        throw Exception('Token have no found!');
      }
      final header = _getAuthHeaders(token);

      // Format dates as YYYY-MM-DD strings
      final String formattedCheckIn =
          '${checkIn.year}-${checkIn.month.toString().padLeft(2, '0')}-${checkIn.day.toString().padLeft(2, '0')}';
      final String formattedCheckOut =
          '${checkOut.year}-${checkOut.month.toString().padLeft(2, '0')}-${checkOut.day.toString().padLeft(2, '0')}';

      final body = {
        'check_in': formattedCheckIn,
        'check_out': formattedCheckOut,
        'guests': guests,
        'nights': nights,
      };

      final response = await FetchingData.postHeader(
        ApiEndpoint.searchAvailableRooms,
        header,
        body,
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        // Check if the API response has the expected structure
        if (jsonResponse['success'] == true && jsonResponse['data'] != null) {
          final data = jsonResponse['data'];
          // Parse the entire data object as SearchRoomResponse
          final searchResponse = SearchRoomResponse.fromJson(data);
          return searchResponse;
        } else {
          throw Exception(
            'Invalid response structure: ${jsonResponse['message'] ?? 'Unknown error'}',
          );
        }
      } else {
        throw Exception(
          'Failed to fetching room available ${response.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<HotelListResponseData> searchAvailableHotel(
    int provinceId,
    DateTime checkIn,
    DateTime checkOut,
  ) async {
    try {
      // Format dates as YYYY-MM-DD strings
      final String formattedCheckIn =
          '${checkIn.year}-${checkIn.month.toString().padLeft(2, '0')}-${checkIn.day.toString().padLeft(2, '0')}';
      final String formattedCheckOut =
          '${checkOut.year}-${checkOut.month.toString().padLeft(2, '0')}-${checkOut.day.toString().padLeft(2, '0')}';

      final body = {
        'province_id': provinceId.toString(),
        'check_in': formattedCheckIn,
        'check_out': formattedCheckOut,
      };
      final searchHotelResponse = await FetchingData.getDataPar(
        ApiEndpoint.searchHotels,
        body,
        _baseHeaders,
      );
      print('Search Hotel Data : ${searchHotelResponse.body}');
      if (searchHotelResponse.statusCode == 200) {
        final jsonData = json.decode(searchHotelResponse.body);
        final searchHotel = HotelListResponseData.fromJson(jsonData);
        return searchHotel;
      } else {
        throw Exception(
          'Failed to fetching hotel available ${searchHotelResponse.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }
}
