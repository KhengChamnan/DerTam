import 'package:mobile_frontend/data/repository/abstract/trip_repsitory.dart';
import 'package:mobile_frontend/models/trips/trips.dart';

class LaravelTripApiRepository implements TripRepository {
  @override
  Future<void> confirmTrip(String tripId) {
    // TODO: implement confirmTrip
    throw UnimplementedError();
  }

  @override
  Future<void> createTrip(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  ) {
    // TODO: implement createTrip
    throw UnimplementedError();
  }

  @override
  Future<void> updateTrip(String tripId) {
    // TODO: implement updateTrip
    throw UnimplementedError();
  }

  @override
  Future<void> removePlaceFromTrip(String placeId) {
    // TODO: implement removePlaceFromTrip
    throw UnimplementedError();
  }

  @override
  Future<void> addPlaceToTrip(String placeId) {
    // TODO: implement addPlaceToTrip
    throw UnimplementedError();
  }

  @override
  Future<void> cancelTrip(String tripId) {
    // TODO: implement cancelTrip
    throw UnimplementedError();
  }

  @override
  Future<List<Trip>> getListOfTrip() {
    // TODO: implement getListOfTrip
    throw UnimplementedError();
  }

  @override
  Future<Trip> getTripDetails() {
    // TODO: implement getTripDetails
    throw UnimplementedError();
  }
}
