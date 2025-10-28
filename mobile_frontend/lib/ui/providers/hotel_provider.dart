import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class HotelProvider extends ChangeNotifier {
  final HotelRepository repository;
  HotelProvider({required this.repository});
  AsyncValue<HotelDetail> _hotelDetail = AsyncValue.empty();
  AsyncValue<Room> _roomDetail = AsyncValue.empty();

  // Getters hotel
  AsyncValue<HotelDetail> get hotelDetail => _hotelDetail;
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
}
