import 'package:mobile_frontend/models/bus/bus_booking_response.dart';
import 'package:mobile_frontend/models/bus/bus_detail_response.dart';
import 'package:mobile_frontend/models/bus/bus_schedule.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';

abstract class BusBookingRepository {
  Future<ProvinceResponseData> searchProvinces();
  Future<BusScheduleData> searchBusesSchedule(
    int fromLocation,
    int toLocation,
    DateTime specificDate
  );
  Future<BusDetailResponse> getScheduleDetails(String scheduleId);
  Future<BusScheduleData> getUpcomingJourneys();
  Future<BusBookingResponse> bookBusTicket(
    String scheduleId,
    List<int> seatIds,
  );
}
