import 'package:mobile_frontend/models/bus/bus_schedule.dart';
import 'package:mobile_frontend/models/bus/bus_seat.dart';

class BusBookingResponse {
  final bool success;
  final String message;
  final BusBookingData? data;

  BusBookingResponse({required this.success, required this.message, this.data});

  factory BusBookingResponse.fromJson(Map<String, dynamic> json) {
    return BusBookingResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null
          ? BusBookingData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'message': message, 'data': data?.toJson()};
  }
}

class BusBookingData {
  final BusBooking booking;
  final AbaResponse abaResponse;
  BusBookingData({required this.booking, required this.abaResponse});

  factory BusBookingData.fromJson(Map<String, dynamic> json) {
    return BusBookingData(
      booking: BusBooking.fromJson(json['booking'] as Map<String, dynamic>),
      abaResponse: AbaResponse.fromJson(
        json['aba_response'] as Map<String, dynamic>,
      ),
    );
  }
  Map<String, dynamic> toJson() {
    return {'booking': booking.toJson(), 'aba_response': abaResponse.toJson()};
  }
}

class BusBooking {
  final int? id;
  final String? totalAmount;
  final String? currency;
  final String? status;
  final BusSchedule? schedule;
  final List<BusSeat>? seat;

  BusBooking({
    this.id,
    this.totalAmount,
    this.currency,
    this.status,
    this.schedule,
    this.seat,
  });

  factory BusBooking.fromJson(Map<String, dynamic> json) {
    return BusBooking(
      id: json['id'] as int?,
      totalAmount: json['total_amount']?.toString(),
      currency: json['currency']?.toString(),
      status: json['status']?.toString(),
      schedule: json['schedule'] != null
          ? BusSchedule.fromJson(json['schedule'] as Map<String, dynamic>)
          : null,
      seat: (json['seats'] as List?)
          ?.map(
            (seatJson) => BusSeat.fromJson(seatJson as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'total_amount': totalAmount,
      'currency': currency,
      'status': status,
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
      description: json['description']?.toString() ?? '',
      qrString: json['qrString']?.toString() ?? '',
      qrImage: json['qrImage']?.toString() ?? '',
      abapayDeeplink: json['abapay_deeplink']?.toString() ?? '',
      appStore: json['app_store']?.toString() ?? '',
      playStore: json['play_store']?.toString() ?? '',
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
      code: json['code']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      tranId: json['tran_id']?.toString() ?? '',
    );
  }
  Map<String, dynamic> toJson() {
    return {'code': code, 'message': message, 'tran_id': tranId};
  }
}
