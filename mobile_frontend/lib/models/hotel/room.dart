import 'package:mobile_frontend/models/hotel/amenities.dart';

class Room {
  final int roomPropertiesId;
  final int propertyId;
  final String roomType;
  final String roomDescription;
  final int maxGuests;
  final String roomSize;
  final double pricePerNight;
  final List<String> imagesUrl;
  final List<String> imagePublicIds;
  final List<Amendities> amenities;
  final int? availableRoomcount;

  Room({
    required this.roomPropertiesId,
    required this.propertyId,
    required this.roomType,
    required this.roomDescription,
    required this.maxGuests,
    required this.roomSize,
    required this.pricePerNight,
    required this.imagesUrl,
    required this.imagePublicIds,
    required this.amenities,
    this.availableRoomcount,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      roomPropertiesId: json['room_properties_id'] ?? 0,
      propertyId: json['property_id'] ?? 0,
      roomType: json['room_type'] ?? '',
      roomDescription: json['room_description'] ?? '',
      maxGuests: json['max_guests'] ?? 0,
      roomSize: json['room_size'] ?? '',
      pricePerNight: (json['price_per_night'] ?? 0).toDouble(),
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      imagePublicIds: List<String>.from(json['image_public_ids'] ?? []),
      amenities: List<Amendities>.from(
        json['amenities']?.map((item) => Amendities.fromJson(item)) ?? [],
      ),
      availableRoomcount: json['available_rooms_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'room_properties_id': roomPropertiesId,
      'property_id': propertyId,
      'room_type': roomType,
      'room_description': roomDescription,
      'max_guests': maxGuests,
      'room_size': roomSize,
      'price_per_night': pricePerNight,
      'images_url': imagesUrl,
      'image_public_ids': imagePublicIds,
      'amenities': amenities.map((a) => a.toJson()).toList(),
    };
  }
}
