class BusBookingListResponse {
  final bool success;
  final BusBookingListData data;

  BusBookingListResponse({required this.success, required this.data});

  factory BusBookingListResponse.fromJson(Map<String, dynamic> json) {
    return BusBookingListResponse(
      success: json['success'] as bool,
      data: BusBookingListData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}
// Model for single bus booking detail API response
class BusBookingDetailResponse {
  final bool success;
  final BusBookingItem data;

  BusBookingDetailResponse({required this.success, required this.data});

  factory BusBookingDetailResponse.fromJson(Map<String, dynamic> json) {
    return BusBookingDetailResponse(
      success: json['success'] as bool,
      data: BusBookingItem.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

class BusBookingListData {
  final int currentPage;
  final List<BusBookingItem> data;
  final String firstPageUrl;
  final int? from;
  final int lastPage;
  final String lastPageUrl;
  final List<BusPageLink> links;
  final String? nextPageUrl;
  final String path;
  final int perPage;
  final String? prevPageUrl;
  final int? to;
  final int total;

  BusBookingListData({
    required this.currentPage,
    required this.data,
    required this.firstPageUrl,
    this.from,
    required this.lastPage,
    required this.lastPageUrl,
    required this.links,
    this.nextPageUrl,
    required this.path,
    required this.perPage,
    this.prevPageUrl,
    this.to,
    required this.total,
  });

  factory BusBookingListData.fromJson(Map<String, dynamic> json) {
    return BusBookingListData(
      currentPage: json['current_page'] as int? ?? 1,
      data:
          (json['data'] as List?)
              ?.map(
                (item) => BusBookingItem.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          [],
      firstPageUrl: json['first_page_url'] as String? ?? '',
      from: json['from'] as int?,
      lastPage: json['last_page'] as int? ?? 1,
      lastPageUrl: json['last_page_url'] as String? ?? '',
      links:
          (json['links'] as List?)
              ?.map(
                (link) => BusPageLink.fromJson(link as Map<String, dynamic>),
              )
              .toList() ??
          [],
      nextPageUrl: json['next_page_url'] as String?,
      path: json['path'] as String? ?? '',
      perPage: json['per_page'] as int? ?? 10,
      prevPageUrl: json['prev_page_url'] as String?,
      to: json['to'] as int?,
      total: json['total'] as int? ?? 0,
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

class BusBookingItem {
  final int id;
  final int userId;
  final String totalAmount;
  final String currency;
  final String status;
  final String createdAt;
  final String updatedAt;
  final List<BusBookingItemDetail> bookingItems;
  final List<BusPayment> payments;

  BusBookingItem({
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

  factory BusBookingItem.fromJson(Map<String, dynamic> json) {
    return BusBookingItem(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      totalAmount: json['total_amount'] as String,
      currency: json['currency'] as String,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      bookingItems: (json['booking_items'] as List)
          .map(
            (item) =>
                BusBookingItemDetail.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      payments: (json['payments'] as List)
          .map(
            (payment) => BusPayment.fromJson(payment as Map<String, dynamic>),
          )
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

class BusBookingItemDetail {
  final int id;
  final int bookingId;
  final String itemType;
  final int itemId;
  final int quantity;
  final String unitPrice;
  final String totalPrice;
  final String createdAt;
  final String updatedAt;
  final BusTripDetails busTripDetails;
  final BusScheduleInfo busSchedule;

  BusBookingItemDetail({
    required this.id,
    required this.bookingId,
    required this.itemType,
    required this.itemId,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.createdAt,
    required this.updatedAt,
    required this.busTripDetails,
    required this.busSchedule,
  });

  factory BusBookingItemDetail.fromJson(Map<String, dynamic> json) {
    return BusBookingItemDetail(
      id: json['id'] as int,
      bookingId: json['booking_id'] as int,
      itemType: json['item_type'] as String,
      itemId: json['item_id'] as int,
      quantity: json['quantity'] as int,
      unitPrice: json['unit_price'] as String,
      totalPrice: json['total_price'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      busTripDetails: BusTripDetails.fromJson(
        json['bus_trip_details'] as Map<String, dynamic>,
      ),
      busSchedule: BusScheduleInfo.fromJson(
        json['bus_schedule'] as Map<String, dynamic>,
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
      'bus_trip_details': busTripDetails.toJson(),
      'bus_schedule': busSchedule.toJson(),
    };
  }
}

class BusTripDetails {
  final int id;
  final int bookingItemId;
  final String seatNumber;
  final String passengerName;
  final String departureDate;
  final String createdAt;
  final String updatedAt;

  BusTripDetails({
    required this.id,
    required this.bookingItemId,
    required this.seatNumber,
    required this.passengerName,
    required this.departureDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BusTripDetails.fromJson(Map<String, dynamic> json) {
    return BusTripDetails(
      id: json['id'] as int,
      bookingItemId: json['booking_item_id'] as int,
      seatNumber: json['seat_number'] as String,
      passengerName: json['passenger_name'] as String,
      departureDate: json['departure_date'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_item_id': bookingItemId,
      'seat_number': seatNumber,
      'passenger_name': passengerName,
      'departure_date': departureDate,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class BusScheduleInfo {
  final int scheduleId;
  final int busId;
  final String busName;
  final String busType;
  final String transportationCompany;
  final String fromLocation;
  final String toLocation;
  final String departureTime;
  final String arrivalTime;
  final String durationHours;
  final String price;
  final int availableSeats;
  final String route;
  final String createdAt;
  final String updatedAt;
  final BusInfo bus;

  BusScheduleInfo({
    required this.scheduleId,
    required this.busId,
    required this.busName,
    required this.busType,
    required this.transportationCompany,
    required this.fromLocation,
    required this.toLocation,
    required this.departureTime,
    required this.arrivalTime,
    required this.durationHours,
    required this.price,
    required this.availableSeats,
    required this.route,
    required this.createdAt,
    required this.updatedAt,
    required this.bus,
  });

  factory BusScheduleInfo.fromJson(Map<String, dynamic> json) {
    return BusScheduleInfo(
      scheduleId: json['schedule_id'] as int,
      busId: json['bus_id'] as int,
      busName: json['bus_name'] as String,
      busType: json['bus_type'] as String,
      transportationCompany: json['transportation_company'] as String,
      fromLocation: json['from_location'] as String,
      toLocation: json['to_location'] as String,
      departureTime: json['departure_time'] as String,
      arrivalTime: json['arrival_time'] as String,
      durationHours: json['duration_hours'] as String,
      price: json['price'] as String,
      availableSeats: json['available_seats'] as int,
      route: json['route'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      bus: BusInfo.fromJson(json['bus'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'schedule_id': scheduleId,
      'bus_id': busId,
      'bus_name': busName,
      'bus_type': busType,
      'transportation_company': transportationCompany,
      'from_location': fromLocation,
      'to_location': toLocation,
      'departure_time': departureTime,
      'arrival_time': arrivalTime,
      'duration_hours': durationHours,
      'price': price,
      'available_seats': availableSeats,
      'route': route,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'bus': bus.toJson(),
    };
  }
}

class BusInfo {
  final int busId;
  final int companyId;
  final String createdAt;
  final String updatedAt;
  final int totalSeats;

  BusInfo({
    required this.busId,
    required this.companyId,
    required this.createdAt,
    required this.updatedAt,
    required this.totalSeats,
  });

  factory BusInfo.fromJson(Map<String, dynamic> json) {
    return BusInfo(
      busId: json['bus_id'] as int,
      companyId: json['company_id'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      totalSeats: json['total_seats'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bus_id': busId,
      'company_id': companyId,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'total_seats': totalSeats,
    };
  }
}

class BusPayment {
  final int id;
  final int bookingId;
  final int paymentMethodId;
  final String amount;
  final String status;
  final String providerTransactionId;
  final String createdAt;
  final String updatedAt;

  BusPayment({
    required this.id,
    required this.bookingId,
    required this.paymentMethodId,
    required this.amount,
    required this.status,
    required this.providerTransactionId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BusPayment.fromJson(Map<String, dynamic> json) {
    return BusPayment(
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

class BusPageLink {
  final String? url;
  final String label;
  final bool active;

  BusPageLink({this.url, required this.label, required this.active});

  factory BusPageLink.fromJson(Map<String, dynamic> json) {
    return BusPageLink(
      url: json['url'] as String?,
      label: json['label'] as String,
      active: json['active'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {'url': url, 'label': label, 'active': active};
  }
}


