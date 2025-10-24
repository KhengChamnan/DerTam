import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/hotel_nearby.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class HotelProvider extends ChangeNotifier {
  final HotelRepository repository;
  HotelProvider({required this.repository});
  AsyncValue<List<Hotel>> _hotels = AsyncValue.empty();

  // Getters hotel
  AsyncValue<List<Hotel>> get hotels => _hotels;

  Future<void> fetchHotels() async {
    _hotels = AsyncValue.loading();
    notifyListeners();
    try {
      final hotels = await repository.getHotels();
      _hotels = AsyncValue.success(hotels);
    } catch (e) {
      _hotels = AsyncValue.error(e);
    }
    notifyListeners();
  }
}
