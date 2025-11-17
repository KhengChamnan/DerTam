import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/booking/hotel_booking_list_response.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
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
      hotelProvider.fetchAllHotelBookings();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<BookingItem> _getAllBookings(List<BookingListResponse>? responses) {
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
    final bookingListState = hotelProvider.bookingList;

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
              onPressed: () => Navigator.of(context).pop(),
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
                      _BookingList(
                        bookings: _getAllBookings(bookingListState.data),
                      ),
                      _BookingList(
                        bookings: [],
                      ), // Bus bookings - not implemented yet
                      _BookingList(
                        bookings: _getAllBookings(bookingListState.data),
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Booking ID: ${booking.id} • \$${booking.totalAmount} ${booking.currency}',
            ),
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
                    'Booking #${booking.id}',
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
