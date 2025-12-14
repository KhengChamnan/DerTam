class SearchHotelRoomResponse {
  final bool success;
  final String message;
  final List<HotelRoom> data;

  SearchHotelRoomResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory SearchHotelRoomResponse.fromJson(Map<String, dynamic> json) {
    return SearchHotelRoomResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data:
          (json['data'] as List<dynamic>?)
              ?.map((room) => HotelRoom.fromJson(room as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class HotelRoom {
  final int roomPropertiesId;
  final String roomType;
  final int maxGuests;
  final List<RoomAmenity> amenities;
  final String hotelName;
  final double pricePerNight;
  final String imageUrl;

  HotelRoom({
    required this.roomPropertiesId,
    required this.roomType,
    required this.maxGuests,
    required this.amenities,
    required this.hotelName,
    required this.pricePerNight,
    required this.imageUrl,
  });

  factory HotelRoom.fromJson(Map<String, dynamic> json) {
    return HotelRoom(
      roomPropertiesId: json['room_properties_id'] ?? 0,
      roomType: json['room_type'] ?? '',
      maxGuests: json['max_guests'] ?? 0,
      amenities:
          (json['amenities'] as List<dynamic>?)
              ?.map(
                (amenity) =>
                    RoomAmenity.fromJson(amenity as Map<String, dynamic>),
              )
              .toList() ??
          [],
      hotelName: json['hotel_name'] ?? '',
      pricePerNight: (json['price_per_night'] is int)
          ? (json['price_per_night'] as int).toDouble()
          : (json['price_per_night'] ?? 0.0),
      imageUrl: json['image_url'] ?? '',
    );
  }
}

class RoomAmenity {
  final String amenityName;

  RoomAmenity({required this.amenityName});

  factory RoomAmenity.fromJson(Map<String, dynamic> json) {
    return RoomAmenity(amenityName: json['amenity_name'] ?? '');
  }
}
