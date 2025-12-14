import 'package:mobile_frontend/models/trips/confirm_trip_response.dart';
import 'package:mobile_frontend/models/trips/create_trip_response.dart';
import 'package:mobile_frontend/models/trips/trip_share_model.dart';
import 'package:mobile_frontend/models/trips/trips.dart';

abstract class TripRepository {
  Future<TripResponse> createTrip(
    String tripName,
    DateTime startDate,
    DateTime endDate,
  );
  Future<ConfirmTripResponse> confirmTrip(
    String tripId,
    Map<String, List<int>> dayPlaceIds,
  );
  Future<ConfirmTripResponse> getTripDetail(String tripId);
  Future<List<Trip>> getAllTrips();
  Future<TripShareResponse> generateShareableLink(String tripId);
  Future<ConfirmTripResponse> joinTripViaShareLink(String shareToken);
}
