class Trip {
  final String tripId;
  final String userId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;
  final String tripAccessType;
  final int dayCount;
  Trip({
    required this.tripId,
    required this.userId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
    required this.dayCount,
    required this.tripAccessType,
  });
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Trip && other.tripId == tripId;
  }

  @override
  int get hashCode => tripId.hashCode;

  @override
  String toString() {
    return 'Trip{tripId: $tripId, userId: $userId, tripName: $tripName, startDate: $startDate, endDate: $endDate, dayCount: $dayCount, tripAccessType: $tripAccessType}';
  }

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      tripId: json['trip_id'] ?? 0,
      userId: json['user_id'] ?? 0,
      tripName: json['trip_name'] ?? '',
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: DateTime.parse(json['end_date'] as String),
      dayCount: json['days_count'] ?? 0,
      tripAccessType: json['trip_access_type'] ?? '',
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'trip_id': tripId,
      'user_id': userId,
      'trip_name': tripName,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'day_count': dayCount,
      'trip_access_type': tripAccessType,
    };
  }
}
