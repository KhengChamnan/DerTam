import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/place_repository.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/place/place_category.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';
import 'package:mobile_frontend/models/place/upcoming_event_place.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class PlaceProvider extends ChangeNotifier {
  final PlaceRepository repository;
  PlaceProvider({required this.repository});
  AsyncValue<List<PlaceCategory>> _placeCategory = AsyncValue.empty();
  AsyncValue<List<Place>> _places = AsyncValue.empty();
  AsyncValue<List<Place>> _recommendedPlaces = AsyncValue.empty();
  AsyncValue<List<UpcomingEventPlace>> _upcomingEvents = AsyncValue.empty();
  AsyncValue<PlaceDetailData> _placeDetail = AsyncValue.empty();
  AsyncValue<List<Place>> _searchPlaceResult = AsyncValue.empty();
  AsyncValue<UpcomingEventPlace> _upcomingEventDetail = AsyncValue.empty();
  AsyncValue<List<UpcomingEventPlace>> _slideShow = AsyncValue.empty();

  // Getters
  AsyncValue<List<Place>> get places => _places;
  AsyncValue<List<PlaceCategory>> get placeCategory => _placeCategory;
  AsyncValue<List<Place>> get recommendedPlaces => _recommendedPlaces;
  AsyncValue<List<UpcomingEventPlace>> get upcomingEvents => _upcomingEvents;
  AsyncValue<PlaceDetailData> get placeDetail => _placeDetail;
  AsyncValue<List<Place>> get searchPlaceResult => _searchPlaceResult;
  AsyncValue<UpcomingEventPlace> get upcomingEventDetail =>
      _upcomingEventDetail;
  AsyncValue<List<UpcomingEventPlace>> get slideShow => _slideShow;

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

  Future<List<UpcomingEventPlace>> fetchUpcomingEvents() async {
    _upcomingEvents = AsyncValue.loading();
    notifyListeners();
    try {
      final places = await repository.getUpcomingEvents();
      _upcomingEvents = AsyncValue.success(places);
      notifyListeners();
      return places;
    } catch (e) {
      _upcomingEvents = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<UpcomingEventPlace> fetchUpcomingEventDetail(String eventId) async {
    _upcomingEventDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final detailEvent = await repository.getUpcomingEventDetail(eventId);
      _upcomingEventDetail = AsyncValue.success(detailEvent);
      notifyListeners();
      return detailEvent;
    } catch (e) {
      _upcomingEventDetail = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> getPlaceDetail(String placeId) async {
    _placeDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final place = await repository.getPlaceDetails(placeId);
      _placeDetail = AsyncValue.success(place);
      notifyListeners();
    } catch (e) {
      _placeDetail = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<List<Place>> searchAllPlace(String query) async {
    _searchPlaceResult = AsyncValue.empty();
    notifyListeners();
    try {
      final searchPlace = await repository.searchPlaces(query);
      _searchPlaceResult = AsyncValue.success(searchPlace);
      notifyListeners();
      return searchPlace;
    } catch (e) {
      _searchPlaceResult = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<List<UpcomingEventPlace>> fetchSlideShow() async {
    _slideShow = AsyncValue.loading();
    notifyListeners();
    try {
      final getSlideShow = await repository.getSlideShow();
      _slideShow = AsyncValue.success(getSlideShow);
      notifyListeners();
      return getSlideShow;
    } catch (e) {
      _slideShow = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  /// Clear all cached place data - call this on logout
  void clearAll() {
    _placeCategory = AsyncValue.empty();
    _places = AsyncValue.empty();
    _recommendedPlaces = AsyncValue.empty();
    _upcomingEvents = AsyncValue.empty();
    _placeDetail = AsyncValue.empty();
    _searchPlaceResult = AsyncValue.empty();
    _upcomingEventDetail = AsyncValue.empty();
    _slideShow = AsyncValue.empty();
    notifyListeners();
  }
}
