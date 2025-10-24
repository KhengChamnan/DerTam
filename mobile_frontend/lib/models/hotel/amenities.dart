class Amendities {
  final String amenityId;
  final String roomId;
  final String amenityName;
  final bool? isAvailable;

  Amendities({
    required this.amenityId,
    required this.roomId,
    required this.amenityName,
    this.isAvailable,
  });

  factory Amendities.fromJson(Map<String, dynamic> json) {
    return Amendities(
      amenityId: json['amenity_id'] ?? '',
      roomId: json['room_properties_id'] ?? '',
      amenityName: json['amenity_name'] ?? '',
      isAvailable: json['is_available'] ?? false,
    );
  }
}
