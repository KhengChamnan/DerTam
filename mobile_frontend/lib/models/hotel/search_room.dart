import 'package:mobile_frontend/models/hotel/amenities.dart';
import 'package:mobile_frontend/models/hotel/facilities.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';

class SearchRoomResponse {
  final SearchParams searchParams;
  final int totalResults;
  final List<SearchRoomResult> rooms;

  SearchRoomResponse({
    required this.searchParams,
    required this.totalResults,
    required this.rooms,
  });

  factory SearchRoomResponse.fromJson(Map<String, dynamic> json) {
    return SearchRoomResponse(
      searchParams: SearchParams.fromJson(json['search_params'] ?? {}),
      totalResults: json['total_results'] ?? 0,
      rooms: List<SearchRoomResult>.from(
        json['rooms']?.map((item) => SearchRoomResult.fromJson(item)) ?? [],
      ),
    );
  }
}

class SearchParams {
  final DateTime checkIn;
  final DateTime checkOut;
  final int guests;
  final int nights;

  SearchParams({
    required this.checkIn,
    required this.checkOut,
    required this.guests,
    required this.nights,
  });

  factory SearchParams.fromJson(Map<String, dynamic> json) {
    return SearchParams(
      checkIn: DateTime.parse(json['check_in'] ?? ''),
      checkOut: DateTime.parse(json['check_out'] ?? ''),
      guests: json['guests'] ?? 0,
      nights: json['nights'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'check_in':
          '${checkIn.year}-${checkIn.month.toString().padLeft(2, '0')}-${checkIn.day.toString().padLeft(2, '0')}',
      'check_out':
          '${checkOut.year}-${checkOut.month.toString().padLeft(2, '0')}-${checkOut.day.toString().padLeft(2, '0')}',
      'guests': guests,
      'nights': nights,
    };
  }
}

class SearchRoomResult {
  final int roomPropertiesId;
  final int propertyId;
  final String roomType;
  final String roomDescription;
  final int maxGuests;
  final String roomSize;
  final double pricePerNight;
  final double totalPrice;
  final int numberOfBed;
  final List<String> imagesUrl;
  final int availableRoomsCount;
  final int nights;
  final List<Amendities> amenities;
  final RoomProperty property;

  SearchRoomResult({
    required this.roomPropertiesId,
    required this.propertyId,
    required this.roomType,
    required this.roomDescription,
    required this.maxGuests,
    required this.roomSize,
    required this.pricePerNight,
    required this.totalPrice,
    required this.numberOfBed,
    required this.imagesUrl,
    required this.availableRoomsCount,
    required this.nights,
    required this.amenities,
    required this.property,
  });

  factory SearchRoomResult.fromJson(Map<String, dynamic> json) {
    return SearchRoomResult(
      roomPropertiesId: json['room_properties_id'] ?? 0,
      propertyId: json['property_id'] ?? 0,
      roomType: json['room_type'] ?? '',
      roomDescription: json['room_description'] ?? '',
      maxGuests: json['max_guests'] ?? 0,
      roomSize: json['room_size'] ?? '',
      pricePerNight: (json['price_per_night'] ?? 0).toDouble(),
      totalPrice: (json['total_price'] ?? 0).toDouble(),
      numberOfBed: json['number_of_bed'] ?? 0,
      imagesUrl: List<String>.from(json['images_url'] ?? []),
      availableRoomsCount: json['available_rooms_count'] ?? 0,
      nights: json['nights'] ?? 0,
      amenities: List<Amendities>.from(
        json['amenities']?.map((item) => Amendities.fromJson(item)) ?? [],
      ),
      property: RoomProperty.fromJson(json['property'] ?? {}),
    );
  }

  // Convert SearchRoomResult to Room for booking
  Room toRoom() {
    return Room(
      roomPropertiesId: roomPropertiesId,
      propertyId: propertyId,
      roomType: roomType,
      roomDescription: roomDescription,
      maxGuests: maxGuests,
      roomSize: roomSize,
      pricePerNight: pricePerNight,
      imagesUrl: imagesUrl,
      imagePublicIds: [], // Not available in search results
      amenities: amenities,
    );
  }
}

class RoomProperty {
  final int propertyId;
  final PlaceDetail place;
  final List<Facilities> facilities;

  RoomProperty({
    required this.propertyId,
    required this.place,
    required this.facilities,
  });

  factory RoomProperty.fromJson(Map<String, dynamic> json) {
    return RoomProperty(
      propertyId: json['property_id'] ?? 0,
      place: PlaceDetail.fromJson(json['place'] ?? {}),
      facilities: List<Facilities>.from(
        json['facilities']?.map((item) => Facilities.fromJson(item)) ?? [],
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'property_id': propertyId,
      'place': place.toJson(),
      'facilities': facilities.map((f) => f.toJson()).toList(),
    };
  }
}
