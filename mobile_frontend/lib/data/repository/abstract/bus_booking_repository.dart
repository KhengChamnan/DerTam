import 'package:mobile_frontend/models/booking/bus_booking_response.dart';

abstract class BusBookingRepository {
  Future<void> bookBus(
    String userId,
    String busId,
    DateTime travelDate,
    int numberOfSeats,
  );
  Future<void> cancelBooking(String bookingId);
  Future<List<Booking>> getUserBookings(String userId);
}