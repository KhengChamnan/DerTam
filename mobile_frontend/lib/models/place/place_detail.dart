class PlaceDetailResponse {
  final bool success;
  final PlaceDetailData data;

  PlaceDetailResponse({required this.success, required this.data});

  factory PlaceDetailResponse.fromJson(Map<String, dynamic> json) {
    return PlaceDetailResponse(
      success: json['success'] ?? false,
      data: PlaceDetailData.fromJson(json['data']),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

class PlaceDetailData {
  final PlaceDetail placeDetail;
  final List<String> listOfImageUrl;
  final List<NearbyPlace> nearbyPlace;
  final List<NearByHotel> hotelNearby;
  final List<NearByRestaurant> restaurantNearby;

  PlaceDetailData({
    required this.placeDetail,
    required this.listOfImageUrl,
    required this.nearbyPlace,
    required this.hotelNearby,
    required this.restaurantNearby,
  });

  factory PlaceDetailData.fromJson(Map<String, dynamic> json) {
    try {
      return PlaceDetailData(
        placeDetail: PlaceDetail.fromJson(json['placeDetail'] ?? {}),
        listOfImageUrl: List<String>.from(json['listOfImageUrl'] ?? []),
        nearbyPlace:
            (json['nearbyPlace'] as List<dynamic>?)
                ?.map((e) => NearbyPlace.fromJson(e))
                .toList() ??
            [],
        hotelNearby:
            (json['hotelNearby'] as List<dynamic>?)
                ?.map((e) => NearByHotel.fromJson(e))
                .toList() ??
            [],
        restaurantNearby:
            (json['restaurantNearby'] as List<dynamic>?)
                ?.map((e) => NearByRestaurant.fromJson(e))
                .toList() ??
            [],
      );
    } catch (e) {
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'placeDetail': placeDetail.toJson(),
      'listOfImageUrl': listOfImageUrl,
      'nearbyPlace': nearbyPlace.map((e) => e.toJson()).toList(),
    };
  }
}

class PlaceDetail {
  final int placeID;
  final String name;
  final String description;
  final String categoryName;
  final String categoryDescription;
  final String googleMapsLink;
  final double ratings;
  final int reviewsCount;
  final bool entryFree;
  final Map<String, dynamic> operatingHours;
  final String bestSeasonToVisit;
  final String provinceCategoryName;
  final String provinceDescription;
  final double latitude;
  final double longitude;
  final String createdAt;
  final String updatedAt;

  PlaceDetail({
    required this.placeID,
    required this.name,
    required this.description,
    required this.categoryName,
    required this.categoryDescription,
    required this.googleMapsLink,
    required this.ratings,
    required this.reviewsCount,
    required this.entryFree,
    required this.operatingHours,
    required this.bestSeasonToVisit,
    required this.provinceCategoryName,
    required this.provinceDescription,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PlaceDetail.fromJson(Map<String, dynamic> json) {
    try {
      return PlaceDetail(
        placeID: json['placeID'] ?? 0,
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        categoryName: json['category_name'] ?? '',
        categoryDescription: json['category_description'] ?? '',
        googleMapsLink: json['google_maps_link'] ?? '',
        ratings: (json['ratings'] ?? 0.0).toDouble(),
        reviewsCount: json['reviews_count'] ?? 0,
        entryFree: json['entry_free'] ?? false,
        operatingHours: Map<String, dynamic>.from(
          json['operating_hours'] ?? {},
        ),
        bestSeasonToVisit: json['best_season_to_visit'] ?? '',
        provinceCategoryName: json['province_categoryName'] ?? '',
        provinceDescription: json['province_description'] ?? '',
        latitude: (json['latitude'] ?? 0.0).toDouble(),
        longitude: (json['longitude'] ?? 0.0).toDouble(),
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
      );
    } catch (e) {
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'placeID': placeID,
      'name': name,
      'description': description,
      'category_name': categoryName,
      'category_description': categoryDescription,
      'google_maps_link': googleMapsLink,
      'ratings': ratings,
      'reviews_count': reviewsCount,
      'entry_free': entryFree,
      'operating_hours': operatingHours,
      'best_season_to_visit': bestSeasonToVisit,
      'province_categoryName': provinceCategoryName,
      'province_description': provinceDescription,
      'latitude': latitude,
      'longitude': longitude,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PlaceDetail && other.placeID == placeID;
  }

  @override
  int get hashCode => placeID.hashCode;

  @override
  String toString() {
    return 'PlaceDetail{placeID: $placeID, name: $name, categoryName: $categoryName}';
  }
}

class NearbyPlace {
  final int placeID;
  final String name;
  final String description;
  final String categoryName;
  final String googleMapsLink;
  final double ratings;
  final int reviewsCount;
  final List<String> imagesUrl;
  final bool entryFree;
  final Map<String, String> operatingHours;
  final String provinceCategoryName;
  final double latitude;
  final double longitude;
  final double distance;
  final String distanceText;

  NearbyPlace({
    required this.placeID,
    required this.name,
    required this.description,
    required this.categoryName,
    required this.googleMapsLink,
    required this.ratings,
    required this.reviewsCount,
    required this.imagesUrl,
    required this.entryFree,
    required this.operatingHours,
    required this.provinceCategoryName,
    required this.latitude,
    required this.longitude,
    required this.distance,
    required this.distanceText,
  });

  factory NearbyPlace.fromJson(Map<String, dynamic> json) {
    return NearbyPlace(
      placeID: json['placeID'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryName: json['category_name'] ?? '',
      googleMapsLink: json['google_maps_link'] ?? '',
      ratings: (json['ratings'] ?? 0.0).toDouble(),
      reviewsCount: json['reviews_count'] ?? 0,
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      entryFree: json['entry_free'] ?? false,
      operatingHours: (json['operating_hours'] as Map<String, dynamic>? ?? {})
          .map((key, value) => MapEntry(key, value?.toString() ?? '')),
      provinceCategoryName: json['province_categoryName'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      distance: (json['distance'] ?? 0).toDouble(),
      distanceText: json['distance_text'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'placeID': placeID,
      'name': name,
      'description': description,
      'category_name': categoryName,
      'google_maps_link': googleMapsLink,
      'ratings': ratings,
      'reviews_count': reviewsCount,
      'images_url': imagesUrl,
      'entry_free': entryFree,
      'operating_hours': operatingHours,
      'province_categoryName': provinceCategoryName,
      'latitude': latitude,
      'longitude': longitude,
      'distance': distance,
      'distance_text': distanceText,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NearbyPlace && other.placeID == placeID;
  }

  @override
  int get hashCode => placeID.hashCode;

  @override
  String toString() {
    return 'NearbyPlace{placeID: $placeID, name: $name, distance: $distanceText}';
  }
}

class NearByRestaurant {
  final int placeID;
  final String name;
  final String description;
  final String categoryName;
  final String googleMapsLink;
  final double ratings;
  final int reviewsCount;
  final List<String> imagesUrl;
  final bool entryFree;
  final Map<String, String> operatingHours;
  final String provinceCategoryName;
  final double latitude;
  final double longitude;
  final double distance;
  final String distanceText;

  NearByRestaurant({
    required this.placeID,
    required this.name,
    required this.description,
    required this.categoryName,
    required this.googleMapsLink,
    required this.ratings,
    required this.reviewsCount,
    required this.imagesUrl,
    required this.entryFree,
    required this.operatingHours,
    required this.provinceCategoryName,
    required this.latitude,
    required this.longitude,
    required this.distance,
    required this.distanceText,
  });

  factory NearByRestaurant.fromJson(Map<String, dynamic> json) {
    return NearByRestaurant(
      placeID: json['placeID'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryName: json['category_name'] ?? '',
      googleMapsLink: json['google_maps_link'] ?? '',
      ratings: (json['ratings'] ?? 0.0).toDouble(),
      reviewsCount: json['reviews_count'] ?? 0,
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      entryFree: json['entry_free'] ?? false,
      operatingHours: (json['operating_hours'] as Map<String, dynamic>? ?? {})
          .map((key, value) => MapEntry(key, value?.toString() ?? '')),
      provinceCategoryName: json['province_categoryName'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      distance: (json['distance'] ?? 0).toDouble(),
      distanceText: json['distance_text'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'placeID': placeID,
      'name': name,
      'description': description,
      'category_name': categoryName,
      'google_maps_link': googleMapsLink,
      'ratings': ratings,
      'reviews_count': reviewsCount,
      'images_url': imagesUrl,
      'entry_free': entryFree,
      'operating_hours': operatingHours,
      'province_categoryName': provinceCategoryName,
      'latitude': latitude,
      'longitude': longitude,
      'distance': distance,
      'distance_text': distanceText,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NearByRestaurant && other.placeID == placeID;
  }

  @override
  int get hashCode => placeID.hashCode;

  @override
  String toString() {
    return 'NearByRestaurant{placeID: $placeID, name: $name, distance: $distanceText}';
  }
}

class NearByHotel {
  final String placeID;
  final String name;
  final String description;
  final String categoryName;
  final String googleMapsLink;
  final double ratings;
  final int reviewsCount;
  final List<String> imagesUrl;
  final bool entryFree;
  final Map<String, String> operatingHours;
  final String provinceCategoryName;
  final double latitude;
  final double longitude;
  final double distance;
  final String distanceText;

  NearByHotel({
    required this.placeID,
    required this.name,
    required this.description,
    required this.categoryName,
    required this.googleMapsLink,
    required this.ratings,
    required this.reviewsCount,
    required this.imagesUrl,
    required this.entryFree,
    required this.operatingHours,
    required this.provinceCategoryName,
    required this.latitude,
    required this.longitude,
    required this.distance,
    required this.distanceText,
  });
  factory NearByHotel.fromJson(Map<String, dynamic> json) {
    return NearByHotel(
      placeID: (json['placeID'] ?? 0).toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryName: json['category_name'] ?? '',
      googleMapsLink: json['google_maps_link'] ?? '',
      ratings: (json['ratings'] ?? 0.0).toDouble(),
      reviewsCount: json['reviews_count'] ?? 0,
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      entryFree: json['entry_free'] ?? false,
      operatingHours: (json['operating_hours'] as Map<String, dynamic>? ?? {})
          .map((key, value) => MapEntry(key, value?.toString() ?? '')),
      provinceCategoryName: json['province_categoryName'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      distance: (json['distance'] ?? 0).toDouble(),
      distanceText: json['distance_text'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'placeID': placeID,
      'name': name,
      'description': description,
      'category_name': categoryName,
      'google_maps_link': googleMapsLink,
      'ratings': ratings,
      'reviews_count': reviewsCount,
      'images_url': imagesUrl,
      'entry_free': entryFree,
      'operating_hours': operatingHours,
      'province_categoryName': provinceCategoryName,
      'latitude': latitude,
      'longitude': longitude,
      'distance': distance,
      'distance_text': distanceText,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NearByRestaurant && other.placeID == placeID;
  }

  @override
  int get hashCode => placeID.hashCode;

  @override
  String toString() {
    return 'NearByRestaurant{placeID: $placeID, name: $name, distance: $distanceText}';
  }
}
