class HotelBookingResponse {
  final int bookingId;
  final int? tripId;
  final String fullName;
  final int age;
  final String gender;
  final String mobile;
  final String email;
  final String idNumber;
  final String? idImage;
  final String? publicImageId;
  final String? imageUrl;
  final String checkIn;
  final String checkOut;
  final String totalAmount;
  final String paymentMethod;
  final String status;
  final String merchantRefNo;
  final String? tranId;
  final String? paymentDate;
  final String paymentStatus;
  final String createdAt;
  final String updatedAt;
  final int userId;
  final List<BookingRoom> bookingRooms;
  final dynamic trip;

  HotelBookingResponse({
    required this.bookingId,
    this.tripId,
    required this.fullName,
    required this.age,
    required this.gender,
    required this.mobile,
    required this.email,
    required this.idNumber,
    this.idImage,
    this.publicImageId,
    this.imageUrl,
    required this.checkIn,
    required this.checkOut,
    required this.totalAmount,
    required this.paymentMethod,
    required this.status,
    required this.merchantRefNo,
    this.tranId,
    this.paymentDate,
    required this.paymentStatus,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    required this.bookingRooms,
    this.trip,
  });

  factory HotelBookingResponse.fromJson(Map<String, dynamic> json) {
    return HotelBookingResponse(
      bookingId: json['booking_id'] as int,
      tripId: json['trip_id'] as int?,
      fullName: json['full_name'] as String,
      age: json['age'] as int,
      gender: json['gender'] as String,
      mobile: json['mobile'] as String,
      email: json['email'] as String,
      idNumber: json['id_number'] as String,
      idImage: json['id_image'] as String?,
      publicImageId: json['public_image_id'] as String?,
      imageUrl: json['image_url'] as String?,
      checkIn: json['check_in'] as String,
      checkOut: json['check_out'] as String,
      totalAmount: json['total_amount'] as String,
      paymentMethod: json['payment_method'] as String,
      status: json['status'] as String,
      merchantRefNo: json['merchant_ref_no'] as String,
      tranId: json['tran_id'] as String?,
      paymentDate: json['payment_date'] as String?,
      paymentStatus: json['payment_status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      userId: json['user_id'] as int,
      bookingRooms: (json['booking_rooms'] as List<dynamic>)
          .map((room) => BookingRoom.fromJson(room as Map<String, dynamic>))
          .toList(),
      trip: json['trip'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_id': bookingId,
      'trip_id': tripId,
      'full_name': fullName,
      'age': age,
      'gender': gender,
      'mobile': mobile,
      'email': email,
      'id_number': idNumber,
      'id_image': idImage,
      'public_image_id': publicImageId,
      'image_url': imageUrl,
      'check_in': checkIn,
      'check_out': checkOut,
      'total_amount': totalAmount,
      'payment_method': paymentMethod,
      'status': status,
      'merchant_ref_no': merchantRefNo,
      'tran_id': tranId,
      'payment_date': paymentDate,
      'payment_status': paymentStatus,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'user_id': userId,
      'booking_rooms': bookingRooms.map((room) => room.toJson()).toList(),
      'trip': trip,
    };
  }
}

class BookingRoom {
  final int id;
  final int bookingId;
  final int roomId;
  final RoomProperty roomProperty;

  BookingRoom({
    required this.id,
    required this.bookingId,
    required this.roomId,
    required this.roomProperty,
  });

  factory BookingRoom.fromJson(Map<String, dynamic> json) {
    return BookingRoom(
      id: json['id'] as int,
      bookingId: json['booking_id'] as int,
      roomId: json['room_id'] as int,
      roomProperty: RoomProperty.fromJson(
        json['room_property'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'room_id': roomId,
      'room_property': roomProperty.toJson(),
    };
  }
}

class RoomProperty {
  final int roomPropertiesId;
  final int propertyId;
  final String roomType;
  final int pricePerNight;
  final Property property;

  RoomProperty({
    required this.roomPropertiesId,
    required this.propertyId,
    required this.roomType,
    required this.pricePerNight,
    required this.property,
  });

  factory RoomProperty.fromJson(Map<String, dynamic> json) {
    return RoomProperty(
      roomPropertiesId: json['room_properties_id'] as int,
      propertyId: json['property_id'] as int,
      roomType: json['room_type'] as String,
      pricePerNight: json['price_per_night'] as int,
      property: Property.fromJson(json['property'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'room_properties_id': roomPropertiesId,
      'property_id': propertyId,
      'room_type': roomType,
      'price_per_night': pricePerNight,
      'property': property.toJson(),
    };
  }
}

class Property {
  final int propertyId;
  final int placeId;
  final Place place;

  Property({
    required this.propertyId,
    required this.placeId,
    required this.place,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      propertyId: json['property_id'] as int,
      placeId: json['place_id'] as int,
      place: Place.fromJson(json['place'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'property_id': propertyId,
      'place_id': placeId,
      'place': place.toJson(),
    };
  }
}

class Place {
  final int placeId;
  final String name;
  final String googleMapsLink;
  final double latitude;
  final double longitude;
  final List<String> imagesUrl;

  Place({
    required this.placeId,
    required this.name,
    required this.googleMapsLink,
    required this.latitude,
    required this.longitude,
    required this.imagesUrl,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      placeId: json['placeID'] as int,
      name: json['name'] as String,
      googleMapsLink: json['google_maps_link'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      imagesUrl: (json['images_url'] as List<dynamic>)
          .map((url) => url as String)
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'placeID': placeId,
      'name': name,
      'google_maps_link': googleMapsLink,
      'latitude': latitude,
      'longitude': longitude,
      'images_url': imagesUrl,
    };
  }
}
