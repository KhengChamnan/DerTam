import 'package:mobile_frontend/models/trips/trip_days.dart';
import 'package:mobile_frontend/models/trips/trips.dart';

class TripResponse {
  final bool? success;
  final String? message;
  final Trip? trip;
  final List<TripDays>? tripDays;
  final int? totalDays;

  TripResponse({
    this.success,
    this.message,
    this.trip,
    this.tripDays,
    this.totalDays,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TripResponse &&
        other.success == success &&
        other.message == message &&
        other.trip == trip &&
        other.tripDays == tripDays &&
        other.totalDays == totalDays;
  }

  @override
  int get hashCode =>
      trip.hashCode ^
      tripDays.hashCode ^
      totalDays.hashCode ^
      success.hashCode ^
      message.hashCode;

  factory TripResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    var tripDaysFromJson = data['days'] as List;
    List<TripDays> tripDaysList = tripDaysFromJson
        .map((i) => TripDays.fromJson(i))
        .toList();

    return TripResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      trip: Trip.fromJson(data['trip']),
      tripDays: tripDaysList,
      totalDays: data['total_days'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': {
        'trip': trip?.toJson(),
        'days': tripDays?.map((tripDay) => tripDay.toJson()).toList(),
        'total_days': totalDays,
      },
    };
  }
}
