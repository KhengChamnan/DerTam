import 'package:mobile_frontend/models/hotel/hotel_nearby.dart';

abstract class HotelRepository {
  Future<List<Hotel>> getHotels();
}