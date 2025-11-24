/// Complete bus booking model with all necessary fields
class BusBooking {
  final String id;
  final String userId;
  final String scheduleId;
  final String busId;

  // Journey details
  final String fromLocation;
  final String toLocation;
  final String boardingPoint;
  final String droppingPoint;
  final DateTime travelDate;
  final DateTime departureTime;
  final DateTime arrivalTime;

  // Passenger details
  final List<PassengerInfo> passengers;

  // Seat details
  final List<String> seatNumbers;
  final int numberOfSeats;

  // Pricing details
  final PricingBreakdown pricing;

  // Booking metadata
  final String bookingReference;
  final DateTime bookingDate;
  final BookingStatus status;
  final PaymentStatus paymentStatus;

  // Payment details
  final PaymentInfo? payment;

  // Cancellation details
  final CancellationInfo? cancellation;

  // Contact details
  final String contactName;
  final String contactPhone;
  final String contactEmail;

  const BusBooking({
    required this.id,
    required this.userId,
    required this.scheduleId,
    required this.busId,
    required this.fromLocation,
    required this.toLocation,
    required this.boardingPoint,
    required this.droppingPoint,
    required this.travelDate,
    required this.departureTime,
    required this.arrivalTime,
    required this.passengers,
    required this.seatNumbers,
    required this.numberOfSeats,
    required this.pricing,
    required this.bookingReference,
    required this.bookingDate,
    required this.status,
    required this.paymentStatus,
    this.payment,
    this.cancellation,
    required this.contactName,
    required this.contactPhone,
    required this.contactEmail,
  });

  factory BusBooking.fromJson(Map<String, dynamic> json) {
    return BusBooking(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      scheduleId: json['schedule_id'] as String,
      busId: json['bus_id'] as String,
      fromLocation: json['from_location'] as String,
      toLocation: json['to_location'] as String,
      boardingPoint: json['boarding_point'] as String,
      droppingPoint: json['dropping_point'] as String,
      travelDate: DateTime.parse(json['travel_date'] as String),
      departureTime: DateTime.parse(json['departure_time'] as String),
      arrivalTime: DateTime.parse(json['arrival_time'] as String),
      passengers: (json['passengers'] as List)
          .map((p) => PassengerInfo.fromJson(p as Map<String, dynamic>))
          .toList(),
      seatNumbers: (json['seat_numbers'] as List).cast<String>(),
      numberOfSeats: json['number_of_seats'] as int,
      pricing: PricingBreakdown.fromJson(
        json['pricing'] as Map<String, dynamic>,
      ),
      bookingReference: json['booking_reference'] as String,
      bookingDate: DateTime.parse(json['booking_date'] as String),
      status: BookingStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => BookingStatus.pending,
      ),
      paymentStatus: PaymentStatus.values.firstWhere(
        (e) => e.name == json['payment_status'],
        orElse: () => PaymentStatus.pending,
      ),
      payment: json['payment'] != null
          ? PaymentInfo.fromJson(json['payment'] as Map<String, dynamic>)
          : null,
      cancellation: json['cancellation'] != null
          ? CancellationInfo.fromJson(
              json['cancellation'] as Map<String, dynamic>,
            )
          : null,
      contactName: json['contact_name'] as String,
      contactPhone: json['contact_phone'] as String,
      contactEmail: json['contact_email'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'schedule_id': scheduleId,
      'bus_id': busId,
      'from_location': fromLocation,
      'to_location': toLocation,
      'boarding_point': boardingPoint,
      'dropping_point': droppingPoint,
      'travel_date': travelDate.toIso8601String(),
      'departure_time': departureTime.toIso8601String(),
      'arrival_time': arrivalTime.toIso8601String(),
      'passengers': passengers.map((p) => p.toJson()).toList(),
      'seat_numbers': seatNumbers,
      'number_of_seats': numberOfSeats,
      'pricing': pricing.toJson(),
      'booking_reference': bookingReference,
      'booking_date': bookingDate.toIso8601String(),
      'status': status.name,
      'payment_status': paymentStatus.name,
      'payment': payment?.toJson(),
      'cancellation': cancellation?.toJson(),
      'contact_name': contactName,
      'contact_phone': contactPhone,
      'contact_email': contactEmail,
    };
  }

  bool get isCancellable {
    if (status == BookingStatus.cancelled ||
        status == BookingStatus.completed) {
      return false;
    }
    // Allow cancellation up to 2 hours before departure
    final cancellationDeadline = departureTime.subtract(
      const Duration(hours: 2),
    );
    return DateTime.now().isBefore(cancellationDeadline);
  }

  String get displayBookingReference => 'BUS-${bookingReference.toUpperCase()}';
}

/// Passenger information for bus booking
class PassengerInfo {
  final String name;
  final int age;
  final Gender gender;
  final String seatNumber;
  final String? idType; // Passport, National ID, etc.
  final String? idNumber;

  const PassengerInfo({
    required this.name,
    required this.age,
    required this.gender,
    required this.seatNumber,
    this.idType,
    this.idNumber,
  });

  factory PassengerInfo.fromJson(Map<String, dynamic> json) {
    return PassengerInfo(
      name: json['name'] as String,
      age: json['age'] as int,
      gender: Gender.values.firstWhere(
        (e) => e.name == json['gender'],
        orElse: () => Gender.other,
      ),
      seatNumber: json['seat_number'] as String,
      idType: json['id_type'] as String?,
      idNumber: json['id_number'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'age': age,
      'gender': gender.name,
      'seat_number': seatNumber,
      'id_type': idType,
      'id_number': idNumber,
    };
  }
}

enum Gender { male, female, other }

/// Detailed pricing breakdown
class PricingBreakdown {
  final double baseFare;
  final double tax;
  final double serviceFee;
  final double discount;
  final double convenienceFee;
  final double seatCharges; // Extra charges for premium seats
  final double total;
  final String currency;

  const PricingBreakdown({
    required this.baseFare,
    required this.tax,
    required this.serviceFee,
    required this.discount,
    required this.convenienceFee,
    required this.seatCharges,
    required this.total,
    this.currency = 'LKR',
  });

  factory PricingBreakdown.fromJson(Map<String, dynamic> json) {
    return PricingBreakdown(
      baseFare: (json['base_fare'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      serviceFee: (json['service_fee'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      convenienceFee: (json['convenience_fee'] as num).toDouble(),
      seatCharges: (json['seat_charges'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'LKR',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'base_fare': baseFare,
      'tax': tax,
      'service_fee': serviceFee,
      'discount': discount,
      'convenience_fee': convenienceFee,
      'seat_charges': seatCharges,
      'total': total,
      'currency': currency,
    };
  }
}

/// Payment information
class PaymentInfo {
  final String paymentId;
  final String paymentMethod; // card, upi, wallet, cash
  final String transactionId;
  final DateTime paymentDate;
  final PaymentStatus status;

  const PaymentInfo({
    required this.paymentId,
    required this.paymentMethod,
    required this.transactionId,
    required this.paymentDate,
    required this.status,
  });

  factory PaymentInfo.fromJson(Map<String, dynamic> json) {
    return PaymentInfo(
      paymentId: json['payment_id'] as String,
      paymentMethod: json['payment_method'] as String,
      transactionId: json['transaction_id'] as String,
      paymentDate: DateTime.parse(json['payment_date'] as String),
      status: PaymentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'payment_id': paymentId,
      'payment_method': paymentMethod,
      'transaction_id': transactionId,
      'payment_date': paymentDate.toIso8601String(),
      'status': status.name,
    };
  }
}

enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  refunded,
  partiallyRefunded,
}

/// Cancellation details
class CancellationInfo {
  final String cancellationId;
  final DateTime cancellationDate;
  final String reason;
  final double refundAmount;
  final double cancellationCharges;
  final RefundStatus refundStatus;
  final DateTime? refundDate;

  const CancellationInfo({
    required this.cancellationId,
    required this.cancellationDate,
    required this.reason,
    required this.refundAmount,
    required this.cancellationCharges,
    required this.refundStatus,
    this.refundDate,
  });

  factory CancellationInfo.fromJson(Map<String, dynamic> json) {
    return CancellationInfo(
      cancellationId: json['cancellation_id'] as String,
      cancellationDate: DateTime.parse(json['cancellation_date'] as String),
      reason: json['reason'] as String,
      refundAmount: (json['refund_amount'] as num).toDouble(),
      cancellationCharges: (json['cancellation_charges'] as num).toDouble(),
      refundStatus: RefundStatus.values.firstWhere(
        (e) => e.name == json['refund_status'],
        orElse: () => RefundStatus.pending,
      ),
      refundDate: json['refund_date'] != null
          ? DateTime.parse(json['refund_date'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cancellation_id': cancellationId,
      'cancellation_date': cancellationDate.toIso8601String(),
      'reason': reason,
      'refund_amount': refundAmount,
      'cancellation_charges': cancellationCharges,
      'refund_status': refundStatus.name,
      'refund_date': refundDate?.toIso8601String(),
    };
  }
}

enum RefundStatus { pending, processing, completed, rejected }

enum BookingStatus {
  pending, // Awaiting payment
  confirmed, // Payment successful
  cancelled, // Cancelled by user or system
  completed, // Journey completed
  noShow, // User didn't board
}
