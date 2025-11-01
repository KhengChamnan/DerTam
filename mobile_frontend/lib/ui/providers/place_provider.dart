import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/place_repository.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/place/place_category.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class PlaceProvider extends ChangeNotifier {
  final PlaceRepository repository;
  PlaceProvider({required this.repository});
  AsyncValue<List<PlaceCategory>> _placeCategory = AsyncValue.empty();
  AsyncValue<List<Place>> _places = AsyncValue.empty();
  AsyncValue<List<Place>> _recommendedPlaces = AsyncValue.empty();
  AsyncValue<List<Place>> _upcomingEvents = AsyncValue.empty();
  AsyncValue<PlaceDetailData> _placeDetail = AsyncValue.empty();

  // Getters
  AsyncValue<List<Place>> get places => _places;
  AsyncValue<List<PlaceCategory>> get placeCategory => _placeCategory;
  AsyncValue<List<Place>> get recommendedPlaces => _recommendedPlaces;
  AsyncValue<List<Place>> get upcomingEvents => _upcomingEvents;
  AsyncValue<PlaceDetailData> get placeDetail => _placeDetail;

  Future<void> fetchPlaceCategories() async {
    _placeCategory = AsyncValue.loading();
    notifyListeners();
    try {
      final categories = await repository.getCategory();
      _placeCategory = AsyncValue.success(categories);
    } catch (e) {
      _placeCategory = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<void> getPlacesByCategory(int categoryId) async {
    _places = AsyncValue.loading();
    notifyListeners();
    try {
      final places = await repository.getPlacesByCategory(
        categoryId.toString(),
      );
      _places = AsyncValue.success(places);
    } catch (e) {
      _places = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<void> fetchRecommendedPlaces() async {
    _recommendedPlaces = AsyncValue.loading();
    notifyListeners();
    try {
      final places = await repository.getRecommendedPlaces();
      _recommendedPlaces = AsyncValue.success(places);
    } catch (e) {
      _recommendedPlaces = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<void> searchPlaces(String query) async {
    _places = AsyncValue.loading();
    notifyListeners();
    try {
      final places = await repository.searchPlaces(query);
      _places = AsyncValue.success(places);
    } catch (e) {
      _places = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<void> fetchUpcomingEvents() async {
    _upcomingEvents = AsyncValue.loading();
    notifyListeners();
    try {
      final places = await repository.getUpcomingEvents();
      _upcomingEvents = AsyncValue.success(places);
    } catch (e) {
      _upcomingEvents = AsyncValue.error(e);
    }
    notifyListeners();
  }
  Future<void> getPlaceDetail(String placeId) async {
    _placeDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final place = await repository.getPlaceDetails(placeId);
      _placeDetail = AsyncValue.success(place);
    } catch (e) {
      _placeDetail = AsyncValue.error(e);
    }
    notifyListeners();
  }
}
