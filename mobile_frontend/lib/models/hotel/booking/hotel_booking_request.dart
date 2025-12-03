class HotelBookingResponse {
  final bool success;
  final String message;
  final HotelBookingData? data;

  HotelBookingResponse({
    required this.success,
    required this.message,
    this.data,
  });
  factory HotelBookingResponse.fromJson(Map<String, dynamic> json) {
    return HotelBookingResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null
          ? HotelBookingData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'message': message, 'data': data?.toJson()};
  }
}

class HotelBookingData {
  final Booking booking;
  final AbaResponse abaResponse;
  HotelBookingData({required this.booking, required this.abaResponse});

  factory HotelBookingData.fromJson(Map<String, dynamic> json) {
    return HotelBookingData(
      booking: Booking.fromJson(json['booking'] as Map<String, dynamic>),
      abaResponse: AbaResponse.fromJson(
        json['aba_response'] as Map<String, dynamic>,
      ),
    );
  }
  Map<String, dynamic> toJson() {
    return {'booking': booking.toJson(), 'aba_response': abaResponse.toJson()};
  }
}

class Booking {
  final int id;
  final String totalAmount;
  final String currency;
  final String status;
  final String checkIn;
  final String checkOut;
  final int nights;
  final List<BookingItem> bookingItems;

  Booking({
    required this.id,
    required this.totalAmount,
    required this.currency,
    required this.status,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.bookingItems,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as int,
      totalAmount: json['total_amount'] as String,
      currency: json['currency'] as String,
      status: json['status'] as String,
      checkIn: json['check_in'] as String,
      checkOut: json['check_out'] as String,
      nights: json['nights'] as int,
      bookingItems: (json['booking_items'] as List<dynamic>)
          .map((item) => BookingItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'total_amount': totalAmount,
      'currency': currency,
      'status': status,
      'check_in': checkIn,
      'check_out': checkOut,
      'nights': nights,
      'booking_items': bookingItems.map((item) => item.toJson()).toList(),
    };
  }
}

class BookingItem {
  final int bookingItemId;
  final int roomPropertyId;
  final int quantity;
  final int unitPrice;
  final int totalPrice;
  final String checkIn;
  final String checkOut;
  final int nights;

  BookingItem({
    required this.bookingItemId,
    required this.roomPropertyId,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
  });

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    return BookingItem(
      bookingItemId: json['booking_item_id'] as int,
      roomPropertyId: json['room_property_id'] as int,
      quantity: json['quantity'] as int,
      unitPrice: json['unit_price'] as int,
      totalPrice: json['total_price'] as int,
      checkIn: json['check_in'] as String,
      checkOut: json['check_out'] as String,
      nights: json['nights'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_item_id': bookingItemId,
      'room_property_id': roomPropertyId,
      'quantity': quantity,
      'unit_price': unitPrice,
      'total_price': totalPrice,
      'check_in': checkIn,
      'check_out': checkOut,
      'nights': nights,
    };
  }
}

class AbaResponse {
  final AbaStatus status;
  final String description;
  final String qrString;
  final String qrImage;
  final String abapayDeeplink;
  final String appStore;
  final String playStore;

  AbaResponse({
    required this.status,
    required this.description,
    required this.qrString,
    required this.qrImage,
    required this.abapayDeeplink,
    required this.appStore,
    required this.playStore,
  });

  factory AbaResponse.fromJson(Map<String, dynamic> json) {
    return AbaResponse(
      status: AbaStatus.fromJson(json['status'] as Map<String, dynamic>),
      description: json['description'] as String,
      qrString: json['qrString'] as String,
      qrImage: json['qrImage'] as String,
      abapayDeeplink: json['abapay_deeplink'] as String,
      appStore: json['app_store'] as String,
      playStore: json['play_store'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status.toJson(),
      'description': description,
      'qrString': qrString,
      'qrImage': qrImage,
      'abapay_deeplink': abapayDeeplink,
      'app_store': appStore,
      'play_store': playStore,
    };
  }
}

class AbaStatus {
  final String code;
  final String message;
  final String tranId;

  AbaStatus({required this.code, required this.message, required this.tranId});

  factory AbaStatus.fromJson(Map<String, dynamic> json) {
    return AbaStatus(
      code: json['code'] as String,
      message: json['message'] as String,
      tranId: json['tran_id'] as String,
    );
  }
  Map<String, dynamic> toJson() {
    return {'code': code, 'message': message, 'tran_id': tranId};
  }
}
