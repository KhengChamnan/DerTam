import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/profile/user_profile_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/hotel/booking/hotel_booking_list_response.dart';
import 'package:mobile_frontend/models/bus/bus_booking_api_response.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_hotel_booking_detail.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_bus_booking_detail.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';
import 'package:provider/provider.dart';

class DertamBookingScreen extends StatefulWidget {
  const DertamBookingScreen({super.key});

  @override
  State<DertamBookingScreen> createState() => _DertamBookingScreenState();
}

class _DertamBookingScreenState extends State<DertamBookingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hotelProvider = context.read<HotelProvider>();
      final busBooking = context.read<BusBookingProvider>();
      hotelProvider.fetchAllHotelBookings();
      busBooking.fetchAllBusBooking();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<BookingItem> _getAllHotelBookings(List<BookingListResponse>? responses) {
    if (responses == null || responses.isEmpty) return [];
    // Extract all booking items from all responses
    List<BookingItem> allItems = [];
    for (var response in responses) {
      if (response.success && response.data.data.isNotEmpty) {
        allItems.addAll(response.data.data);
      }
    }
    return allItems;
  }

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final busBookingProvider = context.watch<BusBookingProvider>();
    final bookingListState = hotelProvider.bookingList;
    final busBookingListState = busBookingProvider.getAllBusBookingResponse;

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: DertamColors.primaryBlue.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(
                context,
              ).push(AnimationUtils.leftToRight(const UserProfile())),
            ),
          ),
        ),
        title: Text(
          'My booking',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            color: DertamColors.primaryBlue,
            fontSize: 24,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Custom Tab Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 25),
            child: Column(
              children: [
                Container(
                  height: 48,
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: DertamColors.primaryBlue,
                        width: 1,
                      ),
                    ),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: DertamColors.primaryBlue,
                    unselectedLabelColor: DertamColors.primaryBlue,
                    labelStyle: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 14,
                    ),
                    unselectedLabelStyle: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 14,
                    ),
                    indicatorColor: DertamColors.primaryBlue,
                    indicatorWeight: 2,
                    indicatorSize: TabBarIndicatorSize.tab,
                    tabs: const [
                      Tab(text: 'ALL'),
                      Tab(text: 'BUS BOOKING'),
                      Tab(text: 'HOTEL BOOKING'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Tab Content
          Expanded(
            child: bookingListState.state == AsyncValueState.loading
                ? const Center(child: CircularProgressIndicator())
                : bookingListState.state == AsyncValueState.error
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red[300],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error loading bookings',
                          style: DertamTextStyles.body.copyWith(
                            color: Colors.red[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () {
                            context
                                .read<HotelProvider>()
                                .fetchAllHotelBookings();
                          },
                          child: Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      // ALL tab - combined hotel and bus bookings
                      _CombinedBookingList(
                        hotelBookings: _getAllHotelBookings(
                          bookingListState.data,
                        ),
                        busBookings:
                            busBookingListState.data?.data?.bookings ?? [],
                      ),
                      // BUS BOOKING tab
                      _BusBookingList(
                        bookings:
                            busBookingListState.data?.data?.bookings ?? [],
                        isLoading:
                            busBookingListState.state ==
                            AsyncValueState.loading,
                        hasError:
                            busBookingListState.state == AsyncValueState.error,
                        onRetry: () => context
                            .read<BusBookingProvider>()
                            .fetchAllBusBooking(),
                      ),
                      // HOTEL BOOKING tab
                      _BookingList(
                        bookings: _getAllHotelBookings(bookingListState.data),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final List<BookingItem> bookings;
  const _BookingList({required this.bookings});
  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No bookings found',
              style: DertamTextStyles.body.copyWith(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 14),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 13),
          child: _BookingCard(booking: bookings[index]),
        );
      },
    );
  }
}

class _BookingCard extends StatelessWidget {
  final BookingItem booking;
  const _BookingCard({required this.booking});
  String _getDateRange() {
    if (booking.bookingItems.isEmpty) return 'N/A';
    final hotelDetails = booking.bookingItems.first.hotelDetails;
    final checkIn = DateTime.parse(hotelDetails.checkIn);
    final checkOut = DateTime.parse(hotelDetails.checkOut);
    return '${checkIn.day}/${checkIn.month}/${checkIn.year} - ${checkOut.day}/${checkOut.month}/${checkOut.year}';
  }

  String _getRoomInfo() {
    if (booking.bookingItems.isEmpty) return 'No rooms';
    final totalRooms = booking.bookingItems.fold<int>(
      0,
      (sum, item) => sum + item.quantity,
    );
    return '$totalRooms room(s) • ${booking.bookingItems.first.hotelDetails.nights} night(s)';
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                DertamBookingDetailScreen(bookingId: booking.id.toString()),
          ),
        );
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 100,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: DertamColors.white,
          border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            // Icon Container
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.hotel,
                color: DertamColors.primaryPurple,
                size: 27,
              ),
            ),
            const SizedBox(width: 12),
            // Booking Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '#${booking.payments.first.providerTransactionId}',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getDateRange(),
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  Text(
                    _getRoomInfo(),
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: DertamColors.primaryBlue,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Status Badge
            Container(
              height: 27,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _getStatusColor(booking.status),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  _getStatusText(booking.status),
                  style: DertamTextStyles.bodySmall.copyWith(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: DertamColors.primaryBlue,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return const Color(0xFFE4E6E8);
      case 'confirmed':
        return const Color(0x6178F192); // rgba(120,241,146,0.38)
      case 'pending':
        return const Color(0xFFFFF4E6);
      case 'cancelled':
        return const Color(0xFFFFE6E6);
      default:
        return const Color(0xFFE4E6E8);
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}

// Combined booking list for ALL tab
class _CombinedBookingList extends StatelessWidget {
  final List<BookingItem> hotelBookings;
  final List<BusBooking> busBookings;

  const _CombinedBookingList({
    required this.hotelBookings,
    required this.busBookings,
  });

  @override
  Widget build(BuildContext context) {
    if (hotelBookings.isEmpty && busBookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No bookings found',
              style: DertamTextStyles.body.copyWith(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    final totalItems = hotelBookings.length + busBookings.length;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 14),
      itemCount: totalItems,
      itemBuilder: (context, index) {
        // Show bus bookings first, then hotel bookings
        if (index < busBookings.length) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 13),
            child: _BusBookingCard(booking: busBookings[index]),
          );
        } else {
          final hotelIndex = index - busBookings.length;
          return Padding(
            padding: const EdgeInsets.only(bottom: 13),
            child: _BookingCard(booking: hotelBookings[hotelIndex]),
          );
        }
      },
    );
  }
}

// Bus booking list widget
class _BusBookingList extends StatelessWidget {
  final List<BusBooking> bookings;
  final bool isLoading;
  final bool hasError;
  final VoidCallback onRetry;

  const _BusBookingList({
    required this.bookings,
    required this.isLoading,
    required this.hasError,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Error loading bus bookings',
              style: DertamTextStyles.body.copyWith(color: Colors.red[600]),
            ),
            const SizedBox(height: 8),
            TextButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No bus bookings found',
              style: DertamTextStyles.body.copyWith(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 14),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 13),
          child: _BusBookingCard(booking: bookings[index]),
        );
      },
    );
  }
}

// Bus booking card widget
class _BusBookingCard extends StatelessWidget {
  final BusBooking booking;

  const _BusBookingCard({required this.booking});

  String _formatDateTime(String dateTimeStr) {
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } catch (e) {
      return dateTimeStr;
    }
  }

  String _getSeatInfo() {
    return '${booking.seatsCount} seat(s) • ${booking.totalAmount} ${booking.currency}';
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                BusBookingDetailScreen(bookingId: booking.bookingId.toString()),
          ),
        );
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 100,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: DertamColors.white,
          border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            // Icon Container
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.directions_bus,
                color: DertamColors.primaryPurple,
                size: 27,
              ),
            ),
            const SizedBox(width: 12),
            // Booking Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    booking.bus?.name ?? 'Bus #${booking.bookingId}',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDateTime(booking.bookedAt),
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  Text(
                    _getSeatInfo(),
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: DertamColors.primaryBlue,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Status Badge
            Container(
              height: 27,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _getStatusColor(booking.status),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  _getStatusText(booking.status),
                  style: DertamTextStyles.bodySmall.copyWith(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w400,
                    fontSize: 12,
                    color: DertamColors.primaryBlue,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return const Color(0xFFE4E6E8);
      case 'confirmed':
        return const Color(0x6178F192);
      case 'pending':
        return const Color(0xFFFFF4E6);
      case 'cancelled':
        return const Color(0xFFFFE6E6);
      default:
        return const Color(0xFFE4E6E8);
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}
