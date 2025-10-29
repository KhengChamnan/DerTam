class Amendities {
  final int amenityId;
  final String amenityName;
  final String? imageUrl;
  final String? imagePublicIds;
  final AmenityPivot? pivot;

  Amendities({
    required this.amenityId,
    required this.amenityName,
    this.imageUrl,
    this.imagePublicIds,
    this.pivot,
  });

  factory Amendities.fromJson(Map<String, dynamic> json) {
    return Amendities(
      amenityId: json['amenity_id'] ?? 0,
      amenityName: json['amenity_name'] ?? '',
      imageUrl: json['image_url'],
      imagePublicIds: json['image_public_ids'],
      pivot: json['pivot'] != null
          ? AmenityPivot.fromJson(json['pivot'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amenity_id': amenityId,
      'amenity_name': amenityName,
      'image_url': imageUrl,
      'image_public_ids': imagePublicIds,
      'pivot': pivot?.toJson(),
    };
  }
}

class AmenityPivot {
  final int roomPropertiesId;
  final int amenityId;

  AmenityPivot({required this.roomPropertiesId, required this.amenityId});

  factory AmenityPivot.fromJson(Map<String, dynamic> json) {
    return AmenityPivot(
      roomPropertiesId: json['room_properties_id'] ?? 0,
      amenityId: json['amenity_id'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {'room_properties_id': roomPropertiesId, 'amenity_id': amenityId};
  }
}
