import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class HotelProvider extends ChangeNotifier {
  final HotelRepository repository;
  HotelProvider({required this.repository});
  AsyncValue<HotelDetail> _hotelDetail = AsyncValue.empty();
  AsyncValue<List<HotelList>> _hotelList = AsyncValue.empty();
  AsyncValue<Room> _roomDetail = AsyncValue.empty();

  // Getters hotel
  AsyncValue<HotelDetail> get hotelDetail => _hotelDetail;
  AsyncValue<List<HotelList>> get hotelList => _hotelList;
  AsyncValue<Room> get roomDetail => _roomDetail;

  Future<void> fetchHotelDetail(String hotelId) async {
    _hotelDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final hotelsDetailResponse = await repository.getHotelDetails(hotelId);
      _hotelDetail = AsyncValue.success(hotelsDetailResponse);
      notifyListeners();
    } catch (e) {
      _hotelDetail = AsyncValue.error(e);
      notifyListeners();
    }
  }

  Future<void> fetchRoomDetail(String roomId) async {
    _roomDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final roomDetailResponse = await repository.getRoomDetails(roomId);
      _roomDetail = AsyncValue.success(roomDetailResponse);
      notifyListeners();
    } catch (e) {
      _roomDetail = AsyncValue.error(e);
      notifyListeners();
    }
  }

  Future<void> fetchHotelList() async {
    _hotelList = AsyncValue.loading();
    notifyListeners();
    try {
      final hotelListResponse = await repository.getListHotel();
      _hotelList = AsyncValue.success(hotelListResponse);
      notifyListeners();
      print('Hotel Data: ${_hotelList.data?.first.place.name}');
    } catch (e) {
      _hotelList = AsyncValue.error(e);
      notifyListeners();
    }
  }

  // Future<void> bookHotel(
  //   String fullName,
  //   String age,
  //   String gender,
  //   String mobileNumber,
  //   String email,
  //   String idNumber,
  //   String idImage,
  //   DateTime checkinDate,
  //   DateTime checkoutDate,
  //   String paymentMethod,
  //   String roomId,
  // ) async {
  //   try {
  //     await repository.createBooking(
  //       fullName,
  //       age,
  //       gender,
  //       mobileNumber,
  //       email,
  //       idNumber,
  //       idImage,
  //       checkinDate,
  //       checkoutDate,
  //       paymentMethod,
  //       roomId,
  //     );
  //   } catch (e) {
  //     rethrow;
  //   }
  // }
}
