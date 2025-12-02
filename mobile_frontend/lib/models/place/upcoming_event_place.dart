class UpcomingEventPlace {
  final int? id;
  final String? name;
  final String? imageUrl;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? placeId;
  final String? placeName;
  final int? provinceId;

  UpcomingEventPlace({
    this.id,
    this.name,
    this.imageUrl,
    this.startDate,
    this.endDate,
    this.placeId,
    this.placeName,
    this.provinceId,
  });

  factory UpcomingEventPlace.fromJson(Map<String, dynamic> json) {
    return UpcomingEventPlace(
      id: json['id'] ?? 0,
      name: json['title'] ?? '',
      imageUrl: json['image_url'] ?? '',
      startDate: DateTime.parse(json['start_at']),
      endDate: DateTime.parse(json['end_at']),
      placeId: json['place_id'] ?? 0,
      placeName: json['place_name'] ?? '',
      provinceId: json['province_id'] ?? 0,
    );
  }
}
