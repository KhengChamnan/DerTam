import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/place/place_category.dart';
import 'package:mobile_frontend/models/place/place_detail.dart';

abstract class PlaceRepository {
  Future<List<PlaceCategory>> getCategory();
  Future<List<Place>> getRecommendedPlaces();
  Future<List<Place>> getPlacesByCategory(String categoryId);
  Future<PlaceDetailData> getPlaceDetails(String placeId);
  Future<List<Place>> searchPlaces(String query);
  Future<List<Place>> getUpcomingEvents();
}
