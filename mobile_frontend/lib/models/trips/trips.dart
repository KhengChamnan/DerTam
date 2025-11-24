class Trip {
  final int tripId;
  final int userId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;
  final String? tripAccessType;
  final int? dayCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? coverImage;

  Trip({
    required this.tripId,
    required this.userId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
    this.dayCount,
    this.tripAccessType,
    this.createdAt,
    this.updatedAt,
    this.coverImage,
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
    return 'Trip{tripId: $tripId, userId: $userId, tripName: $tripName, startDate: $startDate, endDate: $endDate, dayCount: $dayCount, tripAccessType: $tripAccessType, createdAt: $createdAt, updatedAt: $updatedAt}';
  }

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      tripId: json['trip_id'] ?? 0,
      userId: json['user_id'] ?? 0,
      tripName: json['trip_name'] ?? '',
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: DateTime.parse(json['end_date'] as String),
      dayCount: json['days_count'],
      tripAccessType: json['trip_access_type'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
      coverImage: json['image_url'] ?? '',
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'trip_id': tripId,
      'user_id': userId,
      'trip_name': tripName,
      'start_date': startDate.toIso8601String().split('T')[0],
      'end_date': endDate.toIso8601String().split('T')[0],
      if (dayCount != null) 'days_count': dayCount,
      if (tripAccessType != null) 'trip_access_type': tripAccessType,
      if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
      if (coverImage != null) 'image_url': coverImage,
    };
  }
}
