class BusBookingApiResponse {
  final bool success;
  final String message;
  final BusBookingDataResponse? data;

  BusBookingApiResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory BusBookingApiResponse.fromJson(Map<String, dynamic> json) {
    return BusBookingApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? BusBookingDataResponse.fromJson(json['data']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'message': message, 'data': data?.toJson()};
  }
}

class BusBookingDataResponse {
  final List<BusBooking> bookings;
  final int total;

  BusBookingDataResponse({required this.bookings, required this.total});

  factory BusBookingDataResponse.fromJson(Map<String, dynamic> json) {
    return BusBookingDataResponse(
      bookings:
          (json['bookings'] as List<dynamic>?)
              ?.map((e) => BusBooking.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      total: json['total'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookings': bookings.map((e) => e.toJson()).toList(),
      'total': total,
    };
  }
}

class BusBooking {
  final int bookingId;
  final String totalAmount;
  final String currency;
  final String status;
  final String bookedAt;
  final BookingSchedule? schedule;
  final BookingBus? bus;
  final int seatsCount;
  final List<BookingSeat> seats;

  BusBooking({
    required this.bookingId,
    required this.totalAmount,
    required this.currency,
    required this.status,
    required this.bookedAt,
    this.schedule,
    this.bus,
    required this.seatsCount,
    required this.seats,
  });

  factory BusBooking.fromJson(Map<String, dynamic> json) {
    return BusBooking(
      bookingId: json['booking_id'] ?? 0,
      totalAmount: json['total_amount'] ?? '0.00',
      currency: json['currency'] ?? 'USD',
      status: json['status'] ?? '',
      bookedAt: json['booked_at'] ?? '',
      schedule: json['schedule'] != null
          ? BookingSchedule.fromJson(json['schedule'])
          : null,
      bus: json['bus'] != null ? BookingBus.fromJson(json['bus']) : null,
      seatsCount: json['seats_count'] ?? 0,
      seats:
          (json['seats'] as List<dynamic>?)
              ?.map((e) => BookingSeat.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_id': bookingId,
      'total_amount': totalAmount,
      'currency': currency,
      'status': status,
      'booked_at': bookedAt,
      'schedule': schedule?.toJson(),
      'bus': bus?.toJson(),
      'seats_count': seatsCount,
      'seats': seats.map((e) => e.toJson()).toList(),
    };
  }
}

class BookingSchedule {
  final int id;
  final String departureTime;
  final String arrivalTime;
  final int fromLocation;
  final int toLocation;

  BookingSchedule({
    required this.id,
    required this.departureTime,
    required this.arrivalTime,
    required this.fromLocation,
    required this.toLocation,
  });

  factory BookingSchedule.fromJson(Map<String, dynamic> json) {
    return BookingSchedule(
      id: json['id'] ?? 0,
      departureTime: json['departure_time'] ?? '',
      arrivalTime: json['arrival_time'] ?? '',
      fromLocation: json['from_location'] ?? 0,
      toLocation: json['to_location'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'departure_time': departureTime,
      'arrival_time': arrivalTime,
      'from_location': fromLocation,
      'to_location': toLocation,
    };
  }
}

class BookingBus {
  final int id;
  final String name;
  final String plate;
  final String? type;

  BookingBus({
    required this.id,
    required this.name,
    required this.plate,
    this.type,
  });

  factory BookingBus.fromJson(Map<String, dynamic> json) {
    return BookingBus(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      plate: json['plate'] ?? '',
      type: json['type'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'plate': plate, 'type': type};
  }
}

class BookingSeat {
  final int seatId;
  final String seatNumber;
  final String seatType;
  final String price;

  BookingSeat({
    required this.seatId,
    required this.seatNumber,
    required this.seatType,
    required this.price,
  });

  factory BookingSeat.fromJson(Map<String, dynamic> json) {
    return BookingSeat(
      seatId: json['seat_id'] ?? 0,
      seatNumber: json['seat_number'] ?? '',
      seatType: json['seat_type'] ?? '',
      price: json['price'] ?? '0.00',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'seat_id': seatId,
      'seat_number': seatNumber,
      'seat_type': seatType,
      'price': price,
    };
  }
}
