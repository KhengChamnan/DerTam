import 'package:mobile_frontend/models/trips/trips.dart';

abstract class TripRepository {
  Future<void> createTrip(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  );
  Future<List<Trip>> getListOfTrip();
  Future<Trip> getTripDetails();
  Future<void> addPlaceToTrip(String placeId);
  Future<void> removePlaceFromTrip(String placeId);
  Future<void> updateTrip(String tripId);
  Future<void> cancelTrip(String tripId);
  Future<void> confirmTrip(String tripId);
}
