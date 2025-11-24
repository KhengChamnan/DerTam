/// Represents a scheduled bus trip/journey
class BusSchedule {
  final String id;
  final String busId;
  final String routeId;
  final String fromLocation;
  final String toLocation;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final Duration duration;
  final double baseFare;
  final int availableSeats;
  final ScheduleStatus status;
  final List<String> boardingPoints;
  final List<String> droppingPoints;

  const BusSchedule({
    required this.id,
    required this.busId,
    required this.routeId,
    required this.fromLocation,
    required this.toLocation,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.baseFare,
    required this.availableSeats,
    required this.status,
    required this.boardingPoints,
    required this.droppingPoints,
  });

  factory BusSchedule.fromJson(Map<String, dynamic> json) {
    return BusSchedule(
      id: json['id'] as String,
      busId: json['bus_id'] as String,
      routeId: json['route_id'] as String,
      fromLocation: json['from_location'] as String,
      toLocation: json['to_location'] as String,
      departureTime: DateTime.parse(json['departure_time'] as String),
      arrivalTime: DateTime.parse(json['arrival_time'] as String),
      duration: Duration(minutes: json['duration_minutes'] as int),
      baseFare: (json['base_fare'] as num).toDouble(),
      availableSeats: json['available_seats'] as int,
      status: ScheduleStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ScheduleStatus.scheduled,
      ),
      boardingPoints: (json['boarding_points'] as List).cast<String>(),
      droppingPoints: (json['dropping_points'] as List).cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bus_id': busId,
      'route_id': routeId,
      'from_location': fromLocation,
      'to_location': toLocation,
      'departure_time': departureTime.toIso8601String(),
      'arrival_time': arrivalTime.toIso8601String(),
      'duration_minutes': duration.inMinutes,
      'base_fare': baseFare,
      'available_seats': availableSeats,
      'status': status.name,
      'boarding_points': boardingPoints,
      'dropping_points': droppingPoints,
    };
  }

  String get formattedDuration {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }

  bool get isAvailable =>
      status == ScheduleStatus.scheduled &&
      availableSeats > 0 &&
      departureTime.isAfter(DateTime.now());
}

enum ScheduleStatus { scheduled, departed, arrived, cancelled, delayed }
