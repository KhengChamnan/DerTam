import 'package:mobile_frontend/models/trips/trip_days.dart';

class ConfirmTripResponse {
  final bool success;
  final String message;
  final ConfirmTripData data;

  ConfirmTripResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory ConfirmTripResponse.fromJson(Map<String, dynamic> json) {
    return ConfirmTripResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: ConfirmTripData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'message': message, 'data': data.toJson()};
  }
}

class ConfirmTripData {
  final int? tripId;
  final String? tripName;
  final DateTime? startDate;
  final DateTime? endDate;
  final Map<String, TripDays>? days;
  final int? totalPlacesAdded;
  final String? accessType;

  ConfirmTripData({
    this.tripId,
    this.tripName,
    this.startDate,
    this.endDate,
    this.days,
    this.totalPlacesAdded,
    this.accessType,
  });

  factory ConfirmTripData.fromJson(Map<String, dynamic> json) {
    final days = <String, TripDays>{};

    // Handle both formats: nested "trip" object (share link) or flat structure
    final tripData = json['trip'] as Map<String, dynamic>?;
    final int? tripId;
    final String? tripName;
    final DateTime? startDate;
    final DateTime? endDate;

    if (tripData != null) {
      // Share link response format: { "trip": {...}, "days": [...] }
      tripId = tripData['trip_id'];
      tripName = tripData['trip_name'];
      startDate = tripData['start_date'] != null
          ? DateTime.parse(tripData['start_date'])
          : null;
      endDate = tripData['end_date'] != null
          ? DateTime.parse(tripData['end_date'])
          : null;
    } else {
      // Original format: { "trip_id": ..., "days": {...} }
      tripId = json['trip_id'];
      tripName = json['trip_name'];
      startDate = json['start_date'] != null
          ? DateTime.parse(json['start_date'])
          : null;
      endDate = json['end_date'] != null
          ? DateTime.parse(json['end_date'])
          : null;
    }

    final daysData = json['days'];
    if (daysData is List) {
      // Share link response: days is an array
      for (int i = 0; i < daysData.length; i++) {
        final dayJson = daysData[i] as Map<String, dynamic>;
        days['day_${i + 1}'] = TripDays.fromJson(dayJson);
      }
    } else if (daysData is Map<String, dynamic>) {
      // Original format: days is a map
      daysData.forEach((key, value) {
        final dayJson = value as Map<String, dynamic>;
        days[key] = TripDays.fromJson(dayJson);
      });
    }

    return ConfirmTripData(
      tripId: tripId,
      tripName: tripName,
      startDate: startDate,
      endDate: endDate,
      days: days,
      totalPlacesAdded: json['total_places_added'] ?? 0,
      accessType: json['access_type'],
    );
  }

  Map<String, dynamic> toJson() {
    final daysJson = <String, dynamic>{};
    days?.forEach((key, value) {
      daysJson[key] = value.toJson();
    });

    return {
      'trip_id': tripId,
      'days': daysJson,
      'total_places_added': totalPlacesAdded,
    };
  }
}
