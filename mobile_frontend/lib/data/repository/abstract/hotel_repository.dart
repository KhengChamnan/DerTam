import 'package:mobile_frontend/models/booking/hotel_booking_response.dart';
import 'package:mobile_frontend/models/hotel/hotel_detail.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/models/hotel/search_room.dart';

abstract class HotelRepository {
  Future<HotelDetail> getHotelDetails(String hotelId);
  Future<List<HotelList>> getListHotel();
  Future<Room> getRoomDetails(String roomId);
  Future<HotelBookingResponse> createBooking(
    DateTime checkIn,
    DateTime checkOut,
    List<Room> bookingItems,
    String paymentOption,
  );
  Future<List<HotelBookingResponse>> getAllBooking();
  Future<HotelBookingResponse> getBookingDetails(String bookingId);
  Future<void> cancelBooking(String bookingId);
  Future<void> deleteBooking(String bookingId);
  Future<SearchRoomResponse> searchAvailableRooms(
    DateTime checkIn,
    DateTime checkOut,
    int guests,
    int nights,
  );
}
