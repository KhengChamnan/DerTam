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

  ConfirmTripData({
    this.tripId,
    this.tripName,
    this.startDate,
    this.endDate,
    this.days,
    this.totalPlacesAdded,
  });

  factory ConfirmTripData.fromJson(Map<String, dynamic> json) {
    final daysMap = json['days'] as Map<String, dynamic>;
    final days = <String, TripDays>{};
    daysMap.forEach((key, value) {
      final dayJson = value as Map<String, dynamic>;
      days[key] = TripDays.fromJson(dayJson);
    });
    return ConfirmTripData(
      tripId: json['trip_id'] ?? 0,
      tripName: json['trip_name'] ?? '',
      startDate: json['start_date'] != null
          ? DateTime.parse(json['start_date'])
          : null,
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'])
          : null,
      days: days,
      totalPlacesAdded: json['total_places_added'] ?? 0,
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
