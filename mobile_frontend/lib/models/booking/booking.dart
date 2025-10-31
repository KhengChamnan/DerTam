class Booking {
  final String id;
  final String userId;
  final BookingType type;
  final DateTime bookingDate;
  final DateTime startDate;
  final DateTime endDate;
  final String? fromLocation;
  final String? toLocation;
  final String? hotelName;
  final String? roomType;
  final double totalAmount;
  final BookingStatus status;
  final int? numberOfGuests;
  final String? busCompany;
  final String? seatNumber;

  Booking({
    required this.id,
    required this.userId,
    required this.type,
    required this.bookingDate,
    required this.startDate,
    required this.endDate,
    this.fromLocation,
    this.toLocation,
    this.hotelName,
    this.roomType,
    required this.totalAmount,
    required this.status,
    this.numberOfGuests,
    this.busCompany,
    this.seatNumber,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: BookingType.values.firstWhere(
        (e) => e.toString() == 'BookingType.${json['type']}',
        orElse: () => BookingType.bus,
      ),
      bookingDate: DateTime.parse(json['bookingDate'] as String),
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      fromLocation: json['fromLocation'] as String?,
      toLocation: json['toLocation'] as String?,
      hotelName: json['hotelName'] as String?,
      roomType: json['roomType'] as String?,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == 'BookingStatus.${json['status']}',
        orElse: () => BookingStatus.pending,
      ),
      numberOfGuests: json['numberOfGuests'] as int?,
      busCompany: json['busCompany'] as String?,
      seatNumber: json['seatNumber'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type.toString().split('.').last,
      'bookingDate': bookingDate.toIso8601String(),
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'fromLocation': fromLocation,
      'toLocation': toLocation,
      'hotelName': hotelName,
      'roomType': roomType,
      'totalAmount': totalAmount,
      'status': status.toString().split('.').last,
      'numberOfGuests': numberOfGuests,
      'busCompany': busCompany,
      'seatNumber': seatNumber,
    };
  }

  String get displayId {
    final prefix = type == BookingType.bus ? 'BUS' : 'HOTEL';
    return '# $prefix-${id.substring(0, 5).toUpperCase()}';
  }

  String get dateRange {
    final startFormatted =
        '${startDate.day}.${_monthName(startDate.month)}.${startDate.year}';
    final endFormatted =
        '${endDate.day}.${_monthName(endDate.month)}.${endDate.year}';
    return '$startFormatted - $endFormatted';
  }

  String get routeOrLocation {
    if (type == BookingType.bus && fromLocation != null && toLocation != null) {
      return '$fromLocation to $toLocation';
    } else if (type == BookingType.hotel && hotelName != null) {
      return hotelName!;
    }
    return 'N/A';
  }

  String _monthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }
}

enum BookingType { bus, hotel }

enum BookingStatus { pending, confirmed, completed, cancelled }
