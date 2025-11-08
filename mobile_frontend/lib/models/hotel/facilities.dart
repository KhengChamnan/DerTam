class Facilities {
  final int id;
  final String name;
  final int hotelId;
  final String imageUrl;
  final String imagePublicImageId;
  final dynamic pivot; // pivot can be object or string

  Facilities({
    required this.id,
    required this.name,
    required this.hotelId,
    required this.imageUrl,
    required this.imagePublicImageId,
    required this.pivot,
  });

  factory Facilities.fromJson(Map<String, dynamic> json) {
    return Facilities(
      id: json['facility_id'] ?? 0,
      name: json['facility_name'] ?? '',
      hotelId: json['property_id'] ?? 0,
      imageUrl: json['image_url'] ?? '',
      imagePublicImageId: json['image_public_image_id'] ?? '',
      pivot: json['pivot'],
    );
  }
  Map<String, dynamic> toJson() => {
    "facility_id": id,
    "facility_name": name,
    "image_url": imageUrl,
    "image_public_ids": imagePublicImageId,
    "pivot": pivot,
  };
}
