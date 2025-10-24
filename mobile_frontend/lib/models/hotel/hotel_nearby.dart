import 'package:mobile_frontend/models/hotel/facilities.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/models/province/province.dart';

class Hotel {
  final String hotelId;
  final String name;
  final List<String> imageUrl;
  final String googleMapLink;
  final String latitude;
  final String longitude;
  final String rating;
  final String ownerUserId;
  final String provinceCategoryId;
  final Province provinceCategory;
  final String description;
  final String reviewsCount;
  final String createdAt;
  final String updatedAt;
  final List<Room> room;
  final List<Facilities> facilities;
  Hotel({
    required this.name,
    required this.imageUrl,
    required this.hotelId,
    required this.googleMapLink,
    required this.rating,
    required this.latitude,
    required this.longitude,
    required this.ownerUserId,
    required this.provinceCategoryId,
    required this.provinceCategory,
    required this.description,
    required this.reviewsCount,
    required this.createdAt,
    required this.updatedAt,
    required this.room,
    required this.facilities,
  });
  factory Hotel.fromJson(Map<String, dynamic> json) {
    return Hotel(
      hotelId: json['property_id'] ?? '',
      name: json['name'] ?? '',
      imageUrl: List<String>.from(json['images_url'] ?? []),
      googleMapLink: json['google_map_link'] ?? '',
      rating: json['rating'] ?? '0.0',
      latitude: json['latitude'] ?? '',
      longitude: json['longitude'] ?? '',
      ownerUserId: json['owner_user_id'] ?? '',
      provinceCategoryId: json['province_category_id'] ?? '',
      description: json['description'] ?? '',
      reviewsCount: json['reviews_count'] ?? '',
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      provinceCategory: json['province_category'] ?? '',
      facilities: List<Facilities>.from(
        json['facilities']?.map((item) => Facilities.fromJson(item)) ?? [],
      ),
      room: List<Room>.from(
        json['room_properties']?.map((item) => Room.fromJson(item)) ?? [],
      ),
    );
  }
}
