import 'package:mobile_frontend/models/hotel/amenities.dart';
class Room {
  final String roomId;
  final String hotelId;
  final String roomType;
  final String maxGuest;
  final String roomSize;
  final String pricePerNight;
  final bool? isAvailable;
  final String imageUrl;
  final List<Amendities> amenities;

  Room({
    required this.roomId,
    required this.hotelId,
    required this.roomType,
    required this.maxGuest,
    required this.roomSize,
    required this.pricePerNight,
    this.isAvailable,
    required this.imageUrl,
    required this.amenities,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomId: json['room_properties_id'] as String,
      hotelId: json['hotel_id'] as String,
      roomType: json['room_type'] as String,
      maxGuest: json['max_guest'] as String,
      roomSize: json['room_size'] as String,
      pricePerNight: json['price_per_night'] as String,
      isAvailable: json['is_available'] as bool?,
      imageUrl: json['image_url'] as String,
      amenities: List<Amendities>.from(
        json['amenities']?.map((item) => Amendities.fromJson(item)) ?? [],
      ),
    );
  }
}


