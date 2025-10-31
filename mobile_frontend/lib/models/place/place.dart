class Place {
  final String placeId;
  final String name;
  final String description;
  final int categoryId;
  final String googleMapsLink;
  final double ratings;
  final int reviewsCount;
  final String imagesUrl;
  final String imagePublicIds;
  final bool entryFree;
  final Map<String, dynamic> operatingHours;
  final String bestSeasonToVisit;
  final int provinceId;
  final double latitude;
  final double longitude;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String locationName;

  Place({
    required this.placeId,
    required this.name,
    required this.description,
    required this.categoryId,
    required this.googleMapsLink,
    required this.ratings,
    required this.reviewsCount,
    required this.imagesUrl,
    required this.imagePublicIds,
    required this.entryFree,
    required this.operatingHours,
    required this.bestSeasonToVisit,
    required this.provinceId,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    required this.updatedAt,
    required this.locationName,
  });
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Place && other.placeId == placeId;
  }

  @override
  int get hashCode => placeId.hashCode;

  @override
  String toString() {
    return 'Place{placeId: $placeId, name: $name, categoryId: $categoryId}';
  }
}
