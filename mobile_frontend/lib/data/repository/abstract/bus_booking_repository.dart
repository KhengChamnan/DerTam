import 'package:mobile_frontend/models/bus/bus.dart';
import 'package:mobile_frontend/models/bus/bus_schedule.dart';
import 'package:mobile_frontend/models/bus/bus_booking.dart';

/// Abstract repository for bus booking operations
/// Defines all methods needed for a complete bus booking system
abstract class BusBookingRepository {
  // ============= BUS SEARCH & DISCOVERY =============

  /// Search for available buses between two locations on a specific date
  /// Returns list of bus schedules with availability
  Future<List<BusSchedule>> searchBuses({
    required String fromLocation,
    required String toLocation,
    required DateTime travelDate,
  });

  /// Get detailed information about a specific bus
  Future<Bus> getBusDetails(String busId);

  /// Get all schedules for a specific bus
  Future<List<BusSchedule>> getBusSchedules(String busId);

  // ============= SEAT MANAGEMENT =============
  /// Get real-time seat availability for a specific schedule
  /// Returns seat layout with current booking status
  Future<SeatLayout> getSeatAvailability({
    required String scheduleId,
    required DateTime travelDate,
  });

  /// Lock/reserve seats temporarily (e.g., for 10 minutes during checkout)
  /// Prevents other users from booking the same seats
  Future<SeatLockResult> lockSeats({
    required String scheduleId,
    required List<String> seatNumbers,
    required String userId,
    Duration lockDuration = const Duration(minutes: 10),
  });

  /// Release locked seats (e.g., when user cancels or timeout occurs)
  Future<void> unlockSeats({required String lockId});

  // ============= BOOKING CREATION =============

  /// Create a new bus booking
  /// This is the main booking method that handles the complete transaction
  Future<BusBooking> createBooking({
    required String userId,
    required String scheduleId,
    required List<String> seatNumbers,
    required String boardingPoint,
    required String droppingPoint,
    required List<PassengerInfo> passengers,
    required String contactName,
    required String contactPhone,
    required String contactEmail,
    String? promoCode,
  });

  /// Validate booking data before actual booking
  /// Checks seat availability, schedule validity, passenger details, etc.
  Future<BookingValidationResult> validateBooking({
    required String scheduleId,
    required List<String> seatNumbers,
    required DateTime travelDate,
  });

  /// Calculate total price with all charges and discounts
  Future<PricingBreakdown> calculatePrice({
    required String scheduleId,
    required List<String> seatNumbers,
    String? promoCode,
  });

  // ============= PAYMENT =============

  /// Initiate payment for a booking
  Future<PaymentResult> initiatePayment({
    required String bookingId,
    required String paymentMethod,
    required double amount,
  });

  /// Verify payment status (callback from payment gateway)
  Future<bool> verifyPayment({
    required String bookingId,
    required String transactionId,
  });

  /// Confirm booking after successful payment
  Future<BusBooking> confirmBooking(String bookingId);

  // ============= BOOKING RETRIEVAL =============

  /// Get all bookings for a specific user
  Future<List<BusBooking>> getUserBookings(String userId);

  /// Get bookings filtered by status
  Future<List<BusBooking>> getUserBookingsByStatus({
    required String userId,
    required BookingStatus status,
  });

  /// Get detailed information about a specific booking
  Future<BusBooking> getBookingDetails(String bookingId);

  /// Get booking by reference number
  Future<BusBooking?> getBookingByReference(String bookingReference);

  // ============= CANCELLATION & REFUND =============

  /// Check if a booking can be cancelled
  Future<CancellationPolicyResult> checkCancellationPolicy(String bookingId);

  /// Cancel a booking
  Future<CancellationResult> cancelBooking({
    required String bookingId,
    required String reason,
  });

  /// Get refund status for a cancelled booking
  Future<RefundStatus> getRefundStatus(String bookingId);

  // ============= NOTIFICATIONS =============

  /// Send booking confirmation via email/SMS
  Future<void> sendBookingConfirmation(String bookingId);

  /// Send cancellation notification
  Future<void> sendCancellationNotification(String bookingId);

  /// Send boarding pass/ticket
  Future<void> sendBoardingPass(String bookingId);
}

// ============= RESULT MODELS =============

/// Result of seat locking operation
class SeatLockResult {
  final String lockId;
  final List<String> lockedSeats;
  final DateTime expiresAt;
  final bool success;
  final String? errorMessage;

  const SeatLockResult({
    required this.lockId,
    required this.lockedSeats,
    required this.expiresAt,
    required this.success,
    this.errorMessage,
  });
}

/// Result of booking validation
class BookingValidationResult {
  final bool isValid;
  final List<String> errors;
  final List<String> warnings;

  const BookingValidationResult({
    required this.isValid,
    required this.errors,
    required this.warnings,
  });

  bool get hasErrors => errors.isNotEmpty;
  bool get hasWarnings => warnings.isNotEmpty;
}

/// Result of payment initiation
class PaymentResult {
  final String paymentId;
  final String? paymentUrl; // For redirect-based payments
  final String? qrCode; // For QR-based payments
  final PaymentStatus status;
  final String? errorMessage;

  const PaymentResult({
    required this.paymentId,
    this.paymentUrl,
    this.qrCode,
    required this.status,
    this.errorMessage,
  });
}

/// Cancellation policy details
class CancellationPolicyResult {
  final bool canCancel;
  final double refundAmount;
  final double cancellationCharges;
  final double refundPercentage;
  final String reason;
  final DateTime? deadline;

  const CancellationPolicyResult({
    required this.canCancel,
    required this.refundAmount,
    required this.cancellationCharges,
    required this.refundPercentage,
    required this.reason,
    this.deadline,
  });
}

/// Result of cancellation operation
class CancellationResult {
  final bool success;
  final String cancellationId;
  final double refundAmount;
  final String message;
  final RefundStatus refundStatus;

  const CancellationResult({
    required this.success,
    required this.cancellationId,
    required this.refundAmount,
    required this.message,
    required this.refundStatus,
  });
}
