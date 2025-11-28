import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/bus_booking_repository.dart';
import 'package:mobile_frontend/models/bus/bus_booking_response.dart';
import 'package:mobile_frontend/models/bus/bus_detail_response.dart';
import 'package:mobile_frontend/models/bus/bus_schedule.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class BusBookingProvider extends ChangeNotifier {
  final BusBookingRepository busBookingRepository;
  BusBookingProvider({required this.busBookingRepository});

  AsyncValue<ProvinceResponseData> _location = AsyncValue.empty();
  AsyncValue<BusScheduleData> _busSchedule = AsyncValue.empty();
  AsyncValue<BusDetailResponse> _busScheduleDetail = AsyncValue.empty();
  AsyncValue<BusScheduleData> _upcomingJourneys = AsyncValue.empty();
  AsyncValue<BusBookingResponse> _busBookingResponse = AsyncValue.empty();

  // Selected seat IDs for booking
  Set<int> _selectedSeatIds = {};

  /// Getter
  AsyncValue<ProvinceResponseData> get location => _location;
  AsyncValue<BusScheduleData> get busSchedule => _busSchedule;
  AsyncValue<BusDetailResponse> get busScheduleDetail => _busScheduleDetail;
  AsyncValue<BusScheduleData> get upcomingJourneys => _upcomingJourneys;
  AsyncValue<BusBookingResponse> get busBookingResponse => _busBookingResponse;
  Set<int> get selectedSeatIds => _selectedSeatIds;

  // Methods for managing selected seats
  void toggleSeatSelection(int seatId) {
    if (_selectedSeatIds.contains(seatId)) {
      _selectedSeatIds.remove(seatId);
    } else {
      _selectedSeatIds.add(seatId);
    }
    notifyListeners();
  }

  void clearSelectedSeats() {
    _selectedSeatIds.clear();
    notifyListeners();
  }

  void setSelectedSeats(Set<int> seatIds) {
    _selectedSeatIds = seatIds;
    notifyListeners();
  }

  Future<List<ProvinceCategoryDetail>> fetchListLocation() async {
    _location = AsyncValue.loading();
    notifyListeners();
    try {
      final provinces = await busBookingRepository.searchProvinces();
      _location = AsyncValue.success(provinces);
      notifyListeners();
      return provinces.provinces;
    } catch (e) {
      _location = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<BusScheduleData> fetchBusSchedul(
    int fromLocation,
    int toLocation,
    DateTime specificDate,
  ) async {
    _busSchedule = AsyncValue.loading();
    notifyListeners();
    try {
      final schedule = await busBookingRepository.searchBusesSchedule(
        fromLocation,
        toLocation,
        specificDate,
      );
      _busSchedule = AsyncValue.success(schedule);
      notifyListeners();
      return schedule;
    } catch (e) {
      _busSchedule = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<BusDetailResponse> fetchBusScheduleDetail(String scheduleId) async {
    _busScheduleDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final busDetail = await busBookingRepository.getScheduleDetails(
        scheduleId,
      );
      _busScheduleDetail = AsyncValue.success(busDetail);
      notifyListeners();
      return busDetail;
    } catch (e) {
      _busScheduleDetail = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<BusScheduleData> fetchUpcomingJourney() async {
    _upcomingJourneys = AsyncValue.loading();
    notifyListeners();
    try {
      final upcoming = await busBookingRepository.getUpcomingJourneys();
      _upcomingJourneys = AsyncValue.success(upcoming);
      notifyListeners();
      return upcoming;
    } catch (e) {
      _upcomingJourneys = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<BusBookingResponse> createBusBooking(
    String scheduleId,
    List<int> seatIds,
  ) async {
    _busBookingResponse = AsyncValue.loading();
    notifyListeners();
    try {
      final booking = await busBookingRepository.bookBusTicket(
        scheduleId,
        seatIds,
      );
      _busBookingResponse = AsyncValue.success(booking);
      notifyListeners();
      return booking;
    } catch (e) {
      _busBookingResponse = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }
}
