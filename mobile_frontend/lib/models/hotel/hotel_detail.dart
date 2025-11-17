import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/models/user/owner_user.dart';
import 'package:mobile_frontend/models/hotel/facilities.dart';
import 'package:mobile_frontend/models/hotel/room.dart';

class HotelDetail {
  final int propertyId;
  final int ownerUserId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int placeId;
  final OwnerUser ownerUser;
  final HotelPlace place;
  final List<Facilities> facilities;
  final List<Room> roomProperties;

  HotelDetail({
    required this.propertyId,
    required this.ownerUserId,
    required this.createdAt,
    required this.updatedAt,
    required this.placeId,
    required this.ownerUser,
    required this.place,
    required this.facilities,
    required this.roomProperties,
  });

  factory HotelDetail.fromJson(Map<String, dynamic> json) {
    return HotelDetail(
      propertyId: json['property_id'] ?? 0,
      ownerUserId: json['owner_user_id'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      placeId: json['place_id'] ?? 0,
      ownerUser: OwnerUser.fromJson(json['owner_user'] ?? {}),
      place: HotelPlace.fromJson(json['place'] ?? {}),
      facilities: List<Facilities>.from(
        json['facilities']?.map((item) => Facilities.fromJson(item)) ?? [],
      ),
      roomProperties: List<Room>.from(
        json['room_properties']?.map((item) => Room.fromJson(item)) ?? [],
      ),
    );
  }
}

class HotelPlace {
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
  final int categoryId;
  final ProvinceCategoryDetail provinceCategory;
  final Category category;

  HotelPlace({
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
    required this.categoryId,
    required this.provinceCategory,
    required this.category,
  });

  factory HotelPlace.fromJson(Map<String, dynamic> json) {
    return HotelPlace(
      placeId: json['placeID'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      googleMapLink: json['google_maps_link'] ?? '',
      rating: (json['ratings'] ?? 0.0).toDouble(),
      reviewCount: json['reviews_count'] ?? 0,
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      entryFee: json['entry_free'] ?? false,
      operatingHour: json['operating_hours'] ?? {},
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      provinceId: json['province_id'] ?? 0,
      categoryId: json['category_id'] ?? 0,
      provinceCategory: ProvinceCategoryDetail.fromJson(
        json['province_category'] ?? {},
      ),
      category: Category.fromJson(json['category'] ?? {}),
    );
  }
}



class Category {
  final int placeCategoryId;
  final String categoryName;
  final String categoryDescription;

  Category({
    required this.placeCategoryId,
    required this.categoryName,
    required this.categoryDescription,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      placeCategoryId: json['placeCategoryID'] ?? 0,
      categoryName: json['category_name'] ?? '',
      categoryDescription: json['category_description'] ?? '',
    );
  }
}
