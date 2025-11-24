import 'package:mobile_frontend/data/dto/place_dto.dart';
import 'package:mobile_frontend/models/place/place.dart';

class TripDays {
  final int? tripDayId;
  final int? tripId;
  final int? dayNumber;
  final List<Place>? places;
  final int? placeCounts;
  final DateTime? date;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  TripDays({
    this.tripDayId,
    this.tripId,
    this.dayNumber,
    this.places,
    this.placeCounts,
    this.date,
    this.createdAt,
    this.updatedAt,
  });
  factory TripDays.fromJson(Map<String, dynamic> json) {
    return TripDays(
      tripDayId: json['trip_day_id'],
      tripId: json['trip_id'],
      dayNumber: json['day_number'],
      places: json['places'] != null
          ? (json['places'] as List<dynamic>)
                .map((placeJson) => PlaceDto.fromJson(placeJson))
                .toList()
          : null,
      placeCounts: json['place_counts'],
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      if (tripDayId != null) 'trip_day_id': tripDayId,
      if (tripId != null) 'trip_id': tripId,
      if (dayNumber != null) 'day_number': dayNumber,
      if (places != null)
        'places': places!.map((place) => PlaceDto.toJson(place)).toList(),
      if (placeCounts != null) 'place_counts': placeCounts,
      if (date != null) 'date': date!.toIso8601String().split('T')[0],
      if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
    };
  }
}
