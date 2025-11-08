import 'package:mobile_frontend/models/hotel/hotel_booking_response.dart';
import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';

abstract class HotelRepository {
  Future<HotelDetail> getHotelDetails(String hotelId);
  Future<List<HotelList>> getListHotel();
  Future<Room> getRoomDetails(String roomId);
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
  );
  Future<List<HotelBookingResponse>> getAllBooking();
  Future<HotelBookingResponse> getBookingDetails(String bookingId);
  Future<void> cancelBooking(String bookingId);
  Future<void> deleteBooking(String bookingId);
}
