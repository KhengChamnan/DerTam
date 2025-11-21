// import 'package:mobile_frontend/data/repository/abstract/bus_booking_repository.dart';
// import 'package:mobile_frontend/models/booking/bus_booking_response.dart';
// import 'package:mobile_frontend/models/bus/bus.dart';
// import 'package:mobile_frontend/models/bus/bus_booking.dart';
// import 'package:mobile_frontend/models/bus/bus_schedule.dart';

// class MockBusBookingRepository extends BusBookingRepository {
//   @override
//   Future<PricingBreakdown> calculatePrice({required String scheduleId, required List<String> seatNumbers, String? promoCode}) {
//     // TODO: implement calculatePrice
//     throw UnimplementedError();
//   }

//   @override
//   Future<CancellationResult> cancelBooking({required String bookingId, required String reason}) {
//     // TODO: implement cancelBooking
//     throw UnimplementedError();
//   }

//   @override
//   Future<CancellationPolicyResult> checkCancellationPolicy(String bookingId) {
//     // TODO: implement checkCancellationPolicy
//     throw UnimplementedError();
//   }

//   @override
//   Future<BusBooking> confirmBooking(String bookingId) {
//     // TODO: implement confirmBooking
//     throw UnimplementedError();
//   }

//   @override
//   Future<BusBooking> createBooking({required String userId, required String scheduleId, required List<String> seatNumbers, required String boardingPoint, required String droppingPoint, required List<PassengerInfo> passengers, required String contactName, required String contactPhone, required String contactEmail, String? promoCode}) {
//     // TODO: implement createBooking
//     throw UnimplementedError();
//   }

//   @override
//   Future<BusBooking?> getBookingByReference(String bookingReference) {
//     // TODO: implement getBookingByReference
//     throw UnimplementedError();
//   }

//   @override
//   Future<BusBooking> getBookingDetails(String bookingId) {
//     // TODO: implement getBookingDetails
//     throw UnimplementedError();
//   }

//   @override
//   Future<Bus> getBusDetails(String busId) {
//     // TODO: implement getBusDetails
//     throw UnimplementedError();
//   }

//   @override
//   Future<List<BusSchedule>> getBusSchedules(String busId) {
//     // TODO: implement getBusSchedules
//     throw UnimplementedError();
//   }

//   @override
//   Future<RefundStatus> getRefundStatus(String bookingId) {
//     // TODO: implement getRefundStatus
//     throw UnimplementedError();
//   }

//   @override
//   Future<SeatLayout> getSeatAvailability({required String scheduleId, required DateTime travelDate}) {
//     // TODO: implement getSeatAvailability
//     throw UnimplementedError();
//   }

//   @override
//   Future<List<BusBooking>> getUserBookings(String userId) {
//     // TODO: implement getUserBookings
//     throw UnimplementedError();
//   }

//   @override
//   Future<List<BusBooking>> getUserBookingsByStatus({required String userId, required BookingStatus status}) {
//     // TODO: implement getUserBookingsByStatus
//     throw UnimplementedError();
//   }

//   @override
//   Future<PaymentResult> initiatePayment({required String bookingId, required String paymentMethod, required double amount}) {
//     // TODO: implement initiatePayment
//     throw UnimplementedError();
//   }

//   @override
//   Future<SeatLockResult> lockSeats({required String scheduleId, required List<String> seatNumbers, required String userId, Duration lockDuration = const Duration(minutes: 10)}) {
//     // TODO: implement lockSeats
//     throw UnimplementedError();
//   }

//   @override
//   Future<List<BusSchedule>> searchBuses({required String fromLocation, required String toLocation, required DateTime travelDate}) {
//     // TODO: implement searchBuses
//     throw UnimplementedError();
//   }

//   @override
//   Future<void> sendBoardingPass(String bookingId) {
//     // TODO: implement sendBoardingPass
//     throw UnimplementedError();
//   }

//   @override
//   Future<void> sendBookingConfirmation(String bookingId) {
//     // TODO: implement sendBookingConfirmation
//     throw UnimplementedError();
//   }

//   @override
//   Future<void> sendCancellationNotification(String bookingId) {
//     // TODO: implement sendCancellationNotification
//     throw UnimplementedError();
//   }

//   @override
//   Future<void> unlockSeats({required String lockId}) {
//     // TODO: implement unlockSeats
//     throw UnimplementedError();
//   }

//   @override
//   Future<BookingValidationResult> validateBooking({required String scheduleId, required List<String> seatNumbers, required DateTime travelDate}) {
//     // TODO: implement validateBooking
//     throw UnimplementedError();
//   }

//   @override
//   Future<bool> verifyPayment({required String bookingId, required String transactionId}) {
//     // TODO: implement verifyPayment
//     throw UnimplementedError();
//   }

// }