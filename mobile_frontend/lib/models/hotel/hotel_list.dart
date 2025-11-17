import 'package:mobile_frontend/models/hotel/facilities.dart';
import 'package:mobile_frontend/models/hotel/search_room.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';

class HotelList {
  final int propertyId;
  final int ownerUserId;
  final String createdAt;
  final String updatedAt;
  final int placeId;
  final Place place;
  final List<Facilities> facilities;
  final List<RoomProperty> roomProperties;

  HotelList({
    required this.propertyId,
    required this.ownerUserId,
    required this.createdAt,
    required this.updatedAt,
    required this.placeId,
    required this.place,
    required this.facilities,
    required this.roomProperties,
  });

  factory HotelList.fromJson(Map<String, dynamic> json) => HotelList(
    propertyId: json["property_id"] ?? 0,
    ownerUserId: json["owner_user_id"] ?? 0,
    createdAt: json["created_at"] ?? '',
    updatedAt: json["updated_at"] ?? '',
    placeId: json["place_id"] ?? 0,
    place: Place.fromJson(json["place"] ?? {}),
    facilities: List<Facilities>.from(
      json["facilities"]?.map((x) => Facilities.fromJson(x)) ?? [],
    ),
    roomProperties: List<RoomProperty>.from(
      json["room_properties"]?.map((x) => RoomProperty.fromJson(x)) ?? [],
    ),
  );

  Map<String, dynamic> toJson() => {
    "property_id": propertyId,
    "owner_user_id": ownerUserId,
    "created_at": createdAt,
    "updated_at": updatedAt,
    "place_id": placeId,
    "place": place.toJson(),
    "facilities": List<dynamic>.from(facilities.map((x) => x.toJson())),
    "room_properties": List<dynamic>.from(
      roomProperties.map((x) => x.toJson()),
    ),
  };
}

class Place {
  final int placeId;
  final String name;
  final String description;
  final String googleMapLink;
  final double rating;
  final int reviewCount;
  final List<String> imagesUrl;
  final bool entryFee;
  final Map<String, dynamic> operatingHour;
  final double latitude;
  final double longitude;
  final int provinceId;
  final ProvinceCategoryDetail provinceCategory;

  Place({
    required this.placeId,
    required this.name,
    required this.description,
    required this.googleMapLink,
    required this.rating,
    required this.reviewCount,
    required this.imagesUrl,
    required this.entryFee,
    required this.operatingHour,
    required this.latitude,
    required this.longitude,
    required this.provinceId,
    required this.provinceCategory,
  });

  factory Place.fromJson(Map<String, dynamic> json) => Place(
    placeId: json["placeID"] ?? 0,
    name: json["name"] ?? '',
    description: json["description"] ?? '',
    googleMapLink: json["google_maps_link"] ?? '',
    rating: (json["ratings"] ?? 0).toDouble(),
    reviewCount: json["reviews_count"] ?? 0,
    imagesUrl: json["images_url"] != null
        ? List<String>.from(json["images_url"].map((x) => x))
        : [],
    entryFee: json["entry_free"] ?? false,
    operatingHour: json["operating_hours"] ?? {},
    latitude: (json["latitude"] ?? 0).toDouble(),
    longitude: (json["longitude"] ?? 0).toDouble(),
    provinceId: json["province_id"] ?? 0,
    provinceCategory: json["province_category"] != null
        ? ProvinceCategoryDetail.fromJson(json["province_category"])
        : ProvinceCategoryDetail.fromJson({}),
  );

  Map<String, dynamic> toJson() => {
    "placeID": placeId,
    "name": name,
    "description": description,
    "google_maps_link": googleMapLink,
    "ratings": rating,
    "reviews_count": reviewCount,
    "images_url": List<dynamic>.from(imagesUrl.map((x) => x)),
    "entry_free": entryFee,
    "operating_hours": operatingHour,
    "latitude": latitude,
    "longitude": longitude,
    "province_id": provinceId,
    "province_category": provinceCategory.toJson(),
  };
}
