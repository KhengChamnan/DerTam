import 'package:mobile_frontend/models/hotel/hotel_datial.dart';
import 'package:mobile_frontend/models/hotel/room.dart';

abstract class HotelRepository {
  Future<HotelDetail> getHotelDetails(String hotelId);
  Future<Room> getRoomDetails(String roomId);
}
