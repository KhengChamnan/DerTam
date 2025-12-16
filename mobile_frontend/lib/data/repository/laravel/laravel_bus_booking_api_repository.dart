import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/bus_booking_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/bus/bus_booking_api_response.dart';
import 'package:mobile_frontend/models/bus/bus_booking_request.dart'
    hide BusBookingData, BusBooking;
import 'package:mobile_frontend/models/bus/bus_detail_response.dart';
import 'package:mobile_frontend/models/bus/bus_schedule.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';

class LaravelBusBookingApiRepository extends BusBookingRepository {
  final LaravelAuthApiRepository authentocation;
  LaravelBusBookingApiRepository(this.authentocation);
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  Map<String, String> _getAuthHeaders(String token) => {
    ..._baseHeaders,
    'Authorization': 'Bearer $token',
  };
  @override
  Future<BusBookingResponse> bookBusTicket(
    String scheduleId,
    List<int> seatIds,
  ) async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final header = _getAuthHeaders(token);
      final body = {'schedule_id': scheduleId, 'seat_ids': seatIds};

      final bookTicketResponse = await FetchingData.postHeader(
        ApiEndpoint.busBooking,
        header,
        body,
      );
      print('bookTicketResponse Data: ${bookTicketResponse.body}');
      if (bookTicketResponse.statusCode == 200 ||
          bookTicketResponse.statusCode == 201) {
        final jsonResponse = json.decode(bookTicketResponse.body);
        return BusBookingResponse.fromJson(jsonResponse);
      } else {
        throw Exception(
          'Failed to book bus ticket: ${bookTicketResponse.body}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BusDetailResponse> getScheduleDetails(String scheduleId) async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final header = _getAuthHeaders(token);
      final scheduleDetailResponse = await FetchingData.getData(
        '${ApiEndpoint.scheduleDetails}/$scheduleId',
        header,
      );
      print('Schedule Detail Response: ${scheduleDetailResponse.body}');
      if (scheduleDetailResponse.statusCode == 200) {
        final jsonResponse = json.decode(scheduleDetailResponse.body);
        return BusDetailResponse.fromJson(jsonResponse);
      } else {
        throw Exception(
          'Failed to fetch schedule details: ${scheduleDetailResponse.body}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BusScheduleData> getUpcomingJourneys() async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final header = _getAuthHeaders(token);
      final upcomingJourneyResponse = await FetchingData.getData(
        ApiEndpoint.upcomingJourneys,
        header,
      );
      print('Upcoming Journey Response: ${upcomingJourneyResponse.body}');
      if (upcomingJourneyResponse.statusCode == 200) {
        final jsonResponse = json.decode(upcomingJourneyResponse.body);
        return BusScheduleData.fromUpcomingJourney(jsonResponse);
      } else {
        throw Exception(
          'Failed to fetch upcoming journey: ${upcomingJourneyResponse.body}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BusScheduleData> searchBusesSchedule(
    int fromLocation,
    int toLocation,
    DateTime specificDate,
  ) async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final header = _getAuthHeaders(token);
      final body = <String, String>{
        'from_location': fromLocation.toString(),
        'to_location': toLocation.toString(),
        'specific_date': DateFormat('yyyy-MM-dd').format(specificDate),
      };
      final busScheduleResponse = await FetchingData.getDataPar(
        ApiEndpoint.searchBuses,
        body,
        header,
      );
      print('Bus Schedule Response: ${busScheduleResponse.body}');
      if (busScheduleResponse.statusCode == 200) {
        final jsonResponse = json.decode(busScheduleResponse.body);
        return BusScheduleData.fromSearchBusSchedule(jsonResponse);
      } else {
        throw Exception(
          'Failed to fetch bus schedule: ${busScheduleResponse.body}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<ProvinceResponseData> searchProvinces() async {
    try {
      final provinceResponse = await FetchingData.getData(
        ApiEndpoint.searchProvinces,
        _baseHeaders,
      );
      print('Province Response: ${provinceResponse.body}');
      if (provinceResponse.statusCode == 200) {
        final jsonResponse = json.decode(provinceResponse.body);

        // Extract the 'data' object from the response
        final dataObject = jsonResponse['data'] as Map<String, dynamic>? ?? {};
        return ProvinceResponseData.fromBusBooking(dataObject);
      } else {
        throw Exception('Failed to fetch province: ${provinceResponse.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BusBookingApiResponse> getAllBusBookings() async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('Token not found on get bus booking!');
      }
      final header = _getAuthHeaders(token);
      final getAllBusBookingResponse = await FetchingData.getData(
        ApiEndpoint.getAllBusBooking,
        header,
      );
      print(
        'Get all bus that I have booking: ${getAllBusBookingResponse.body}',
      );
      if (getAllBusBookingResponse.statusCode == 200) {
        final jsonResponse = json.decode(getAllBusBookingResponse.body);
        return BusBookingApiResponse.fromJson(jsonResponse);
      } else {
        throw Exception(
          'Failed to load bus booking bookings: ${getAllBusBookingResponse.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<BusBookingDataResponse> getBookingDetails(String bookingId) async {
    try {
      final token = await authentocation.getToken();
      if (token == null) {
        throw Exception('Token not found on get bus booking detail!');
      }
      final header = _getAuthHeaders(token);
      final getBusBookingDetailResponse = await FetchingData.getData(
        '${ApiEndpoint.getBusBookingDetail}/$bookingId',
        header,
      );
      print('Bus booking Detaiiiiiiil: ${getBusBookingDetailResponse.body}');
      if (getBusBookingDetailResponse.statusCode == 200) {
        final jsonResponse = json.decode(getBusBookingDetailResponse.body);
        // The detail API returns a single booking in 'data', not a list
        // So we parse it as a single BusBooking and wrap it in BusBookingDataResponse
        final bookingData = jsonResponse['data'];
        if (bookingData != null) {
          final booking = BusBooking.fromJson(bookingData);
          return BusBookingDataResponse(bookings: [booking], total: 1);
        } else {
          return BusBookingDataResponse(bookings: [], total: 0);
        }
      } else {
        throw Exception(
          'Failed to load bus booking detail: ${getBusBookingDetailResponse.statusCode}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }
}
