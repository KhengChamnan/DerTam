// Model for booking list API response
class BookingListResponse {
  final bool success;
  final BookingListData data;

  BookingListResponse({required this.success, required this.data});

  factory BookingListResponse.fromJson(Map<String, dynamic> json) {
    return BookingListResponse(
      success: json['success'] as bool,
      data: BookingListData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

class BookingListData {
  final int currentPage;
  final List<BookingItem> data;
  final String firstPageUrl;
  final int from;
  final int lastPage;
  final String lastPageUrl;
  final List<PageLink> links;
  final String? nextPageUrl;
  final String path;
  final int perPage;
  final String? prevPageUrl;
  final int to;
  final int total;

  BookingListData({
    required this.currentPage,
    required this.data,
    required this.firstPageUrl,
    required this.from,
    required this.lastPage,
    required this.lastPageUrl,
    required this.links,
    this.nextPageUrl,
    required this.path,
    required this.perPage,
    this.prevPageUrl,
    required this.to,
    required this.total,
  });

  factory BookingListData.fromJson(Map<String, dynamic> json) {
    return BookingListData(
      currentPage: json['current_page'] as int,
      data: (json['data'] as List)
          .map((item) => BookingItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      firstPageUrl: json['first_page_url'] as String,
      from: json['from'] as int,
      lastPage: json['last_page'] as int,
      lastPageUrl: json['last_page_url'] as String,
      links: (json['links'] as List)
          .map((link) => PageLink.fromJson(link as Map<String, dynamic>))
          .toList(),
      nextPageUrl: json['next_page_url'] as String?,
      path: json['path'] as String,
      perPage: json['per_page'] as int,
      prevPageUrl: json['prev_page_url'] as String?,
      to: json['to'] as int,
      total: json['total'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current_page': currentPage,
      'data': data.map((item) => item.toJson()).toList(),
      'first_page_url': firstPageUrl,
      'from': from,
      'last_page': lastPage,
      'last_page_url': lastPageUrl,
      'links': links.map((link) => link.toJson()).toList(),
      'next_page_url': nextPageUrl,
      'path': path,
      'per_page': perPage,
      'prev_page_url': prevPageUrl,
      'to': to,
      'total': total,
    };
  }
}

class BookingItem {
  final int id;
  final int userId;
  final String totalAmount;
  final String currency;
  final String status;
  final String createdAt;
  final String updatedAt;
  final List<BookingItemDetail> bookingItems;
  final List<Payment> payments;

  BookingItem({
    required this.id,
    required this.userId,
    required this.totalAmount,
    required this.currency,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.bookingItems,
    required this.payments,
  });

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    return BookingItem(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      totalAmount: json['total_amount'] as String,
      currency: json['currency'] as String,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      bookingItems: (json['booking_items'] as List)
          .map(
            (item) => BookingItemDetail.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      payments: (json['payments'] as List)
          .map((payment) => Payment.fromJson(payment as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'total_amount': totalAmount,
      'currency': currency,
      'status': status,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'booking_items': bookingItems.map((item) => item.toJson()).toList(),
      'payments': payments.map((payment) => payment.toJson()).toList(),
    };
  }
}

class BookingItemDetail {
  final int id;
  final int bookingId;
  final String itemType;
  final int itemId;
  final int quantity;
  final String unitPrice;
  final String totalPrice;
  final String createdAt;
  final String updatedAt;
  final HotelDetails hotelDetails;
  final RoomProperty roomProperty;

  BookingItemDetail({
    required this.id,
    required this.bookingId,
    required this.itemType,
    required this.itemId,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.createdAt,
    required this.updatedAt,
    required this.hotelDetails,
    required this.roomProperty,
  });

  factory BookingItemDetail.fromJson(Map<String, dynamic> json) {
    return BookingItemDetail(
      id: json['id'] as int,
      bookingId: json['booking_id'] as int,
      itemType: json['item_type'] as String,
      itemId: json['item_id'] as int,
      quantity: json['quantity'] as int,
      unitPrice: json['unit_price'] as String,
      totalPrice: json['total_price'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      hotelDetails: HotelDetails.fromJson(
        json['hotel_details'] as Map<String, dynamic>,
      ),
      roomProperty: RoomProperty.fromJson(
        json['room_property'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'item_type': itemType,
      'item_id': itemId,
      'quantity': quantity,
      'unit_price': unitPrice,
      'total_price': totalPrice,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'hotel_details': hotelDetails.toJson(),
      'room_property': roomProperty.toJson(),
    };
  }
}

class HotelDetails {
  final int id;
  final int bookingItemId;
  final String checkIn;
  final String checkOut;
  final int nights;
  final String createdAt;
  final String updatedAt;

  HotelDetails({
    required this.id,
    required this.bookingItemId,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HotelDetails.fromJson(Map<String, dynamic> json) {
    return HotelDetails(
      id: json['id'] as int,
      bookingItemId: json['booking_item_id'] as int,
      checkIn: json['check_in'] as String,
      checkOut: json['check_out'] as String,
      nights: json['nights'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_item_id': bookingItemId,
      'check_in': checkIn,
      'check_out': checkOut,
      'nights': nights,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class RoomProperty {
  final int roomPropertiesId;
  final int propertyId;
  final String roomType;
  final String roomDescription;
  final int maxGuests;
  final int numberOfBed;
  final String roomSize;
  final int pricePerNight;
  final List<String> imagesUrl;
  final List<String> imagePublicIds;
  final String createdAt;
  final String updatedAt;
  final int availableRoomsCount;
  final int totalRoomsCount;
  final Property property;

  RoomProperty({
    required this.roomPropertiesId,
    required this.propertyId,
    required this.roomType,
    required this.roomDescription,
    required this.maxGuests,
    required this.numberOfBed,
    required this.roomSize,
    required this.pricePerNight,
    required this.imagesUrl,
    required this.imagePublicIds,
    required this.createdAt,
    required this.updatedAt,
    required this.availableRoomsCount,
    required this.totalRoomsCount,
    required this.property,
  });

  factory RoomProperty.fromJson(Map<String, dynamic> json) {
    return RoomProperty(
      roomPropertiesId: json['room_properties_id'] as int,
      propertyId: json['property_id'] as int,
      roomType: json['room_type'] as String,
      roomDescription: json['room_description'] as String,
      maxGuests: json['max_guests'] as int,
      numberOfBed: json['number_of_bed'] as int,
      roomSize: json['room_size'] as String,
      pricePerNight: json['price_per_night'] as int,
      imagesUrl: List<String>.from(json['images_url'] as List),
      imagePublicIds: List<String>.from(json['image_public_ids'] as List),
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      availableRoomsCount: json['available_rooms_count'] as int,
      totalRoomsCount: json['total_rooms_count'] as int,
      property: Property.fromJson(json['property'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'room_properties_id': roomPropertiesId,
      'property_id': propertyId,
      'room_type': roomType,
      'room_description': roomDescription,
      'max_guests': maxGuests,
      'number_of_bed': numberOfBed,
      'room_size': roomSize,
      'price_per_night': pricePerNight,
      'images_url': imagesUrl,
      'image_public_ids': imagePublicIds,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'available_rooms_count': availableRoomsCount,
      'total_rooms_count': totalRoomsCount,
      'property': property.toJson(),
    };
  }
}

class Property {
  final int propertyId;
  final int ownerUserId;
  final String createdAt;
  final String updatedAt;
  final int placeId;

  Property({
    required this.propertyId,
    required this.ownerUserId,
    required this.createdAt,
    required this.updatedAt,
    required this.placeId,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      propertyId: json['property_id'] as int,
      ownerUserId: json['owner_user_id'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      placeId: json['place_id'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'property_id': propertyId,
      'owner_user_id': ownerUserId,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'place_id': placeId,
    };
  }
}

class Payment {
  final int id;
  final int bookingId;
  final int paymentMethodId;
  final String amount;
  final String status;
  final String providerTransactionId;
  final String createdAt;
  final String updatedAt;

  Payment({
    required this.id,
    required this.bookingId,
    required this.paymentMethodId,
    required this.amount,
    required this.status,
    required this.providerTransactionId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as int,
      bookingId: json['booking_id'] as int,
      paymentMethodId: json['payment_method_id'] as int,
      amount: json['amount'] as String,
      status: json['status'] as String,
      providerTransactionId: json['provider_transaction_id'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'payment_method_id': paymentMethodId,
      'amount': amount,
      'status': status,
      'provider_transaction_id': providerTransactionId,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class PageLink {
  final String? url;
  final String label;
  final bool active;

  PageLink({this.url, required this.label, required this.active});

  factory PageLink.fromJson(Map<String, dynamic> json) {
    return PageLink(
      url: json['url'] as String?,
      label: json['label'] as String,
      active: json['active'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {'url': url, 'label': label, 'active': active};
  }
}

// Model for single booking detail API response
class BookingDetailResponse {
  final bool success;
  final BookingItem data;

  BookingDetailResponse({required this.success, required this.data});

  factory BookingDetailResponse.fromJson(Map<String, dynamic> json) {
    return BookingDetailResponse(
      success: json['success'] as bool,
      data: BookingItem.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}
