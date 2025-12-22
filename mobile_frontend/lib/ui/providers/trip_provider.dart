import 'package:flutter/widgets.dart';
import 'package:mobile_frontend/data/repository/abstract/trip_repsitory.dart';
import 'package:mobile_frontend/models/trips/create_trip_response.dart';
import 'package:mobile_frontend/models/trips/confirm_trip_response.dart';
import 'package:mobile_frontend/models/trips/trip_share_model.dart';
import 'package:mobile_frontend/models/trips/trips.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class TripProvider extends ChangeNotifier {
  final TripRepository tripRepository;
  TripProvider({required this.tripRepository});
  AsyncValue<TripResponse> _createTrip = AsyncValue.empty();
  AsyncValue<ConfirmTripResponse> _confirmTrip = AsyncValue.empty();
  AsyncValue<ConfirmTripResponse> _getTripDetail = AsyncValue.empty();
  AsyncValue<List<Trip>> _getTripList = AsyncValue.empty();
  List<Map<String, dynamic>> _addedPlaces = [];
  AsyncValue<TripShareResponse> _tripShareResponse = AsyncValue.empty();

  ///Getter
  AsyncValue<TripResponse> get createTrip => _createTrip;
  AsyncValue<ConfirmTripResponse> get confirmTrip => _confirmTrip;
  List<Map<String, dynamic>> get addedPlaces => _addedPlaces;
  AsyncValue<ConfirmTripResponse> get getTripDetail => _getTripDetail;
  AsyncValue<List<Trip>> get getTripList => _getTripList;
  AsyncValue<TripShareResponse> get tripShareResponse => _tripShareResponse;

  Future<TripResponse> createTripPlan(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  ) async {
    _createTrip = AsyncValue.loading();
    notifyListeners();
    try {
      final trip = await tripRepository.createTrip(
        tripName,
        startDate,
        endDate,
      );
      _createTrip = AsyncValue.success(trip);
      notifyListeners();
      return trip;
    } catch (e) {
      _createTrip = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<ConfirmTripResponse> confirmTripPlan(
    String tripId,
    Map<String, List<int>> dayPlaceIds,
  ) async {
    _confirmTrip = AsyncValue.loading();
    notifyListeners();
    try {
      final tripConfirm = await tripRepository.confirmTrip(tripId, dayPlaceIds);
      _confirmTrip = AsyncValue.success(tripConfirm);
      notifyListeners();
      return tripConfirm;
    } catch (e) {
      _confirmTrip = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteTrip(String tripId) async {
    try {
      await tripRepository.deleteTrip(tripId);
      await fetchAllTrip();
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<ConfirmTripResponse> fetchTripDetail(String tripId) async {
    _getTripDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final tripDetail = await tripRepository.getTripDetail(tripId);
      _getTripDetail = AsyncValue.success(tripDetail);
      notifyListeners();
      return tripDetail;
    } catch (e) {
      _getTripDetail = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<List<Trip>> fetchAllTrip() async {
    _getTripList = AsyncValue.loading();
    notifyListeners();
    try {
      final allTrips = await tripRepository.getAllTrips();
      _getTripList = AsyncValue.success(allTrips);
      notifyListeners();
      return allTrips;
    } catch (e) {
      _getTripList = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<TripShareResponse> generateShareableLink(String tripId) async {
    _tripShareResponse = AsyncValue.loading();
    notifyListeners();
    try {
      final shareResponse = await tripRepository.generateShareableLink(tripId);
      _tripShareResponse = AsyncValue.success(shareResponse);
      notifyListeners();
      return shareResponse;
    } catch (e) {
      _tripShareResponse = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<ConfirmTripResponse> joinTripViaShareLink(String shareToken) async {
    _confirmTrip = AsyncValue.loading();
    notifyListeners();
    try {
      final tripResponse = await tripRepository.joinTripViaShareLink(
        shareToken,
      );
      _confirmTrip = AsyncValue.success(tripResponse);
      notifyListeners();
      return tripResponse;
    } catch (e) {
      _confirmTrip = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  // Methods to manage added places
  void addPlaceToTrip(Map<String, dynamic> placeData) {
    _addedPlaces.removeWhere(
      (item) => item['place'].placeId == placeData['place'].placeId,
    );
    _addedPlaces.add(placeData);
    notifyListeners();
  }

  void removePlaceFromTrip(String placeId) {
    _addedPlaces.removeWhere((item) => item['place'].placeId == placeId);
    notifyListeners();
  }

  bool isPlaceAdded(String placeId) {
    return _addedPlaces.any((item) => item['place'].placeId == placeId);
  }

  void clearAddedPlaces() {
    _addedPlaces.clear();
    notifyListeners();
  }

  void setAddedPlaces(List<Map<String, dynamic>> places) {
    _addedPlaces = places;
    notifyListeners();
  }

  /// Clear all cached trip data - call this on logout
  void clearAll() {
    _createTrip = AsyncValue.empty();
    _confirmTrip = AsyncValue.empty();
    _getTripDetail = AsyncValue.empty();
    _getTripList = AsyncValue.empty();
    _addedPlaces = [];
    _tripShareResponse = AsyncValue.empty();
    notifyListeners();
  }
}
