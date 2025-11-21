/// Represents a bus/coach with its details and schedule
class Bus {
  final String id;
  final String name;
  final String number; // Bus registration number
  final String operatorName;
  final BusType type;
  final List<String> amenities; // AC, WiFi, Charging, etc.
  final int totalSeats;
  final SeatLayout seatLayout;
  final double rating;
  final int totalReviews;

  const Bus({
    required this.id,
    required this.name,
    required this.number,
    required this.operatorName,
    required this.type,
    required this.amenities,
    required this.totalSeats,
    required this.seatLayout,
    this.rating = 0.0,
    this.totalReviews = 0,
  });

  factory Bus.fromJson(Map<String, dynamic> json) {
    return Bus(
      id: json['id'] as String,
      name: json['name'] as String,
      number: json['number'] as String,
      operatorName: json['operator_name'] as String,
      type: BusType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => BusType.seater,
      ),
      amenities: (json['amenities'] as List).cast<String>(),
      totalSeats: json['total_seats'] as int,
      seatLayout: SeatLayout.fromJson(json['seat_layout']),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['total_reviews'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'number': number,
      'operator_name': operatorName,
      'type': type.name,
      'amenities': amenities,
      'total_seats': totalSeats,
      'seat_layout': seatLayout.toJson(),
      'rating': rating,
      'total_reviews': totalReviews,
    };
  }
}

enum BusType {
  seater, // Regular seats
  sleeper, // Sleeping berths
  semiSleeper, // Mix of seats and sleepers
  acSeater,
  acSleeper,
  luxury,
}

/// Represents the physical layout of seats in a bus
class SeatLayout {
  final int rows;
  final int columns;
  final bool hasUpperDeck;
  final List<List<int>> lowerDeck; // 0=available, 1=booked, 2=blocked
  final List<List<int>>? upperDeck;
  final Map<String, SeatInfo> seatInfo; // Maps seat number to info

  const SeatLayout({
    required this.rows,
    required this.columns,
    required this.hasUpperDeck,
    required this.lowerDeck,
    this.upperDeck,
    required this.seatInfo,
  });

  factory SeatLayout.fromJson(Map<String, dynamic> json) {
    return SeatLayout(
      rows: json['rows'] as int,
      columns: json['columns'] as int,
      hasUpperDeck: json['has_upper_deck'] as bool,
      lowerDeck: (json['lower_deck'] as List)
          .map((row) => (row as List).cast<int>())
          .toList(),
      upperDeck: json['upper_deck'] != null
          ? (json['upper_deck'] as List)
                .map((row) => (row as List).cast<int>())
                .toList()
          : null,
      seatInfo: (json['seat_info'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(key, SeatInfo.fromJson(value)),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rows': rows,
      'columns': columns,
      'has_upper_deck': hasUpperDeck,
      'lower_deck': lowerDeck,
      'upper_deck': upperDeck,
      'seat_info': seatInfo.map((key, value) => MapEntry(key, value.toJson())),
    };
  }
}

/// Detailed information about a specific seat
class SeatInfo {
  final String seatNumber;
  final SeatType type;
  final bool isWindowSeat;
  final double? extraCharge; // Additional cost for premium seats

  const SeatInfo({
    required this.seatNumber,
    required this.type,
    required this.isWindowSeat,
    this.extraCharge,
  });

  factory SeatInfo.fromJson(Map<String, dynamic> json) {
    return SeatInfo(
      seatNumber: json['seat_number'] as String,
      type: SeatType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => SeatType.regular,
      ),
      isWindowSeat: json['is_window_seat'] as bool,
      extraCharge: (json['extra_charge'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'seat_number': seatNumber,
      'type': type.name,
      'is_window_seat': isWindowSeat,
      'extra_charge': extraCharge,
    };
  }
}

enum SeatType {
  regular,
  sleeper,
  premium,
  blocked, // Seats that cannot be booked (driver area, etc.)
}
