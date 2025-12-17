import 'package:mobile_frontend/models/trips/trip_days.dart';
import 'package:mobile_frontend/models/user/user_model.dart';

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
  final UserAccessType? userAccessType;

  ConfirmTripData({
    this.tripId,
    this.tripName,
    this.startDate,
    this.endDate,
    this.days,
    this.totalPlacesAdded,
    this.accessType,
    this.userAccessType,
  });

  factory ConfirmTripData.fromJson(Map<String, dynamic> json) {
    final days = <String, TripDays>{};
    final tripData = json['trip'] as Map<String, dynamic>?;
    final int? tripId;
    final String? tripName;
    final DateTime? startDate;
    final DateTime? endDate;

    if (tripData != null) {
      tripId = tripData['trip_id'];
      tripName = tripData['trip_name'];
      startDate = tripData['start_date'] != null
          ? DateTime.parse(tripData['start_date'])
          : null;
      endDate = tripData['end_date'] != null
          ? DateTime.parse(tripData['end_date'])
          : null;
    } else {
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
      for (int i = 0; i < daysData.length; i++) {
        final dayJson = daysData[i] as Map<String, dynamic>;
        days['day_${i + 1}'] = TripDays.fromJson(dayJson);
      }
    } else if (daysData is Map<String, dynamic>) {
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
      accessType: json['trip_access_type'],
      userAccessType: json['users_with_access'] != null
          ? UserAccessType.fromUserAccessType(
              json['users_with_access'] as Map<String, dynamic>,
            )
          : null,
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

class UserAccessType {
  final int? totalUserJoin;
  final List<User>? userAccess;
  const UserAccessType({this.totalUserJoin, this.userAccess});
  factory UserAccessType.fromUserAccessType(Map<String, dynamic> json) {
    return UserAccessType(
      totalUserJoin: json['total_count'] ?? 0,
      userAccess: (json['users'] as List<dynamic>?)
          ?.map((e) => User.fromTripAccessJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
