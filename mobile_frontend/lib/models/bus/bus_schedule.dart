class BusScheduleData {
  final List<BusSchedule>? schedule;
  final int? totalBus;

  BusScheduleData({this.schedule, this.totalBus});

  factory BusScheduleData.fromSearchBusSchedule(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>?;
    return BusScheduleData(
      schedule: data?['schedules'] != null
          ? (data?['schedules'] as List)
                .map(
                  (item) => BusSchedule.fromJson(item as Map<String, dynamic>),
                )
                .toList()
          : null,
      totalBus: data?['total'] as int?,
    );
  }

  factory BusScheduleData.fromUpcomingJourney(Map<String, dynamic> json) {
    // The response structure is: { "success": true, "data": { "journeys": [...], "total": 1 } }
    final data = json['data'] as Map<String, dynamic>?;
    return BusScheduleData(
      schedule: data?['journeys'] != null
          ? (data?['journeys'] as List)
                .map(
                  (item) => BusSchedule.fromJson(item as Map<String, dynamic>),
                )
                .toList()
          : null,
      totalBus: data?['total'] as int?,
    );
  }
}

class BusSchedule {
  final String? id;
  final String? busName;
  final String? tranCompany;
  final String? fromLocation;
  final String? toLocation;
  final String? departureTime;
  final String? departureDate;
  final String? arrivalTime;
  final String? arrivalDate;
  final String? duration;
  final String? price;
  final int? availableSeats;
  final String? route;
  final String? busType;
  const BusSchedule({
    this.id,
    this.busName,
    this.tranCompany,
    this.fromLocation,
    this.toLocation,
    this.departureTime,
    this.arrivalTime,
    this.departureDate,
    this.arrivalDate,
    this.duration,
    this.availableSeats,
    this.price,
    this.route,
    this.busType,
  });
  factory BusSchedule.fromJson(Map<String, dynamic> json) {
    return BusSchedule(
      id: json['id']?.toString(),
      busName: json['bus_name'] as String?,
      busType: json['bus_type'] as String?,
      tranCompany: json['transportation_company'] as String?,
      fromLocation: json['from_location'] as String?,
      toLocation: json['to_location'] as String?,
      departureTime: json['departure_time'] as String?,
      arrivalTime: json['arrival_time'] as String?,
      departureDate: json['departure_date'] as String?,
      arrivalDate: json['arrival_date'] as String?,
      duration: json['duration_hours']?.toString(),
      price: json['price']?.toString(),
      availableSeats: json['available_seats'] as int?,
      route: json['route'] as String?,
    );
  }
  factory BusSchedule.fromUpcomingJourney(Map<String, dynamic> json) {
    final upcomingJourney = json['data'] ?? json;
    return BusSchedule(
      id: upcomingJourney['id'] as String?,
      busName: upcomingJourney['bus_name'] as String?,
      tranCompany: upcomingJourney['transportation_company'] as String?,
      fromLocation: upcomingJourney['from_location'] as String?,
      toLocation: upcomingJourney['to_location'] as String?,
      departureTime: upcomingJourney['departure_time'] as String?,
      arrivalTime: upcomingJourney['arrival_time'] as String?,
      departureDate: upcomingJourney['departure_date'] as String?,
      arrivalDate: upcomingJourney['arrival_date'] as String?,
      duration: upcomingJourney['duration_hours'] as String?,
      price: upcomingJourney['price'] as String?,
      availableSeats: upcomingJourney['available_seats'] as int?,
    );
  }
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BusSchedule && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
  @override
  String toString() {
    return 'BusSchedule{id: $id, busName: $busName, tranCompany: $tranCompany}';
  }
  
}
