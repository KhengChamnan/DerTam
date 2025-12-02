import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/hotel_repository.dart';
import 'package:mobile_frontend/models/hotel/booking/hotel_booking_list_response.dart';
import 'package:mobile_frontend/models/hotel/booking/hotel_booking_request.dart';
import 'package:mobile_frontend/models/hotel/hotel_detail.dart';
import 'package:mobile_frontend/models/hotel/hotel_list.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/models/hotel/search_room.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class HotelProvider extends ChangeNotifier {
  final HotelRepository repository;
  HotelProvider({required this.repository});
  AsyncValue<HotelDetail> _hotelDetail = AsyncValue.empty();
  AsyncValue<List<HotelList>> _hotelList = AsyncValue.empty();
  AsyncValue<Room> _roomDetail = AsyncValue.empty();
  AsyncValue<HotelBookingResponse> _createBooking = AsyncValue.empty();
  AsyncValue<SearchRoomResponse> _searchAvailableRooms = AsyncValue.empty();
  AsyncValue<List<BookingListResponse>> _hoteBookingList = AsyncValue.empty();
  AsyncValue<BookingDetailResponse> _hotelBookingDetail = AsyncValue.empty();
  AsyncValue<HotelListResponseData> _searchHotel = AsyncValue.empty();

  // Getters hotel
  AsyncValue<HotelDetail> get hotelDetail => _hotelDetail;
  AsyncValue<List<HotelList>> get hotelList => _hotelList;
  AsyncValue<Room> get roomDetail => _roomDetail;
  AsyncValue<HotelBookingResponse> get createBookingState => _createBooking;
  AsyncValue<SearchRoomResponse> get searchAvailableRooms =>
      _searchAvailableRooms;
  AsyncValue<List<BookingListResponse>> get bookingList => _hoteBookingList;
  AsyncValue<BookingDetailResponse> get hotelBookingDetail =>
      _hotelBookingDetail;
  AsyncValue<HotelListResponseData> get searchHotel => _searchHotel;

  Future<void> fetchHotelDetail(String hotelId) async {
    _hotelDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final hotelsDetailResponse = await repository.getHotelDetails(hotelId);
      _hotelDetail = AsyncValue.success(hotelsDetailResponse);
      notifyListeners();
    } catch (e) {
      _hotelDetail = AsyncValue.error(e);
      notifyListeners();
    }
  }

  Future<void> fetchRoomDetail(String roomId) async {
    _roomDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final roomDetailResponse = await repository.getRoomDetails(roomId);
      _roomDetail = AsyncValue.success(roomDetailResponse);
      notifyListeners();
    } catch (e) {
      _roomDetail = AsyncValue.error(e);
      notifyListeners();
    }
  }

  Future<void> fetchHotelList() async {
    _hotelList = AsyncValue.loading();
    notifyListeners();
    try {
      final hotelListResponse = await repository.getListHotel();
      _hotelList = AsyncValue.success(hotelListResponse);
      notifyListeners();
      print('Hotel Data: ${_hotelList.data?.first.place.name}');
    } catch (e) {
      _hotelList = AsyncValue.error(e);
      notifyListeners();
    }
  }

  Future<HotelBookingResponse> createBooking(
    DateTime checkIn,
    DateTime checkOut,
    List<Room> bookingItems,
    String paymentOption,
  ) async {
    _createBooking = AsyncValue.loading();
    notifyListeners();
    try {
      final hotelBookingResponse = await repository.createBooking(
        checkIn,
        checkOut,
        bookingItems,
        paymentOption,
      );
      _createBooking = AsyncValue.success(hotelBookingResponse);
      notifyListeners();
      return hotelBookingResponse;
    } catch (e) {
      print('Booking Error: $e');
      _createBooking = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<List<BookingListResponse>> fetchAllHotelBookings() async {
    _hoteBookingList = AsyncValue.loading();
    notifyListeners();
    try {
      final bookings = await repository.getAllHotelBooking();
      _hoteBookingList = AsyncValue.success(bookings);
      notifyListeners();
      return bookings;
    } catch (e) {
      _hoteBookingList = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<BookingDetailResponse> fetchHotelBookingDetail(
    String bookingId,
  ) async {
    _hotelBookingDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final bookingDetail = await repository.getBookingDetails(bookingId);
      _hotelBookingDetail = AsyncValue.success(bookingDetail);
      notifyListeners();
      return bookingDetail;
    } catch (e) {
      _hotelBookingDetail = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<SearchRoomResponse> searchAvailableRoom(
    DateTime checkIn,
    DateTime checkOut,
    int guests,
    int nights,
  ) async {
    _searchAvailableRooms = AsyncValue.loading();
    notifyListeners();
    try {
      final searchResults = await repository.searchAvailableRooms(
        checkIn,
        checkOut,
        guests,
        nights,
      );
      _searchAvailableRooms = AsyncValue.success(searchResults);
      notifyListeners();
      return searchResults;
    } catch (e) {
      _searchAvailableRooms = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> cancelHotelBooking(String bookingId) async {
    try {
      await repository.cancelHotelBooking(bookingId);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<HotelListResponseData> searchAllHotelList(
    int providenceId,
    DateTime checkIn,
    DateTime checkOut,
  ) async {
    _searchHotel = AsyncValue.loading();
    notifyListeners();
    try {
      final hotel = await repository.searchAvailableHotel(
        providenceId,
        checkIn,
        checkOut,
      );
      _searchHotel = AsyncValue.success(hotel);
      notifyListeners();
      return hotel;
    } catch (e) {
      _searchHotel = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }
}
