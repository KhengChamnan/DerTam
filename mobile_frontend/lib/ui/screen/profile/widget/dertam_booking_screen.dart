import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/booking/bus_booking_response.dart';

class DertamBookingScreen extends StatefulWidget {
  const DertamBookingScreen({super.key});

  @override
  State<DertamBookingScreen> createState() => _DertamBookingScreenState();
}

class _DertamBookingScreenState extends State<DertamBookingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Booking> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadBookings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings() async {
    // TODO: Replace with actual API call
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _bookings = _getMockBookings();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_outlined,
            color: Colors.black,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'My booking',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            color: Colors.black,
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
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Color(0xFF020202), width: 1),
                    ),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: const Color(0xFF020202),
                    unselectedLabelColor: const Color(0xFF020202),
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
                    indicatorColor: const Color(0xFF020202),
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
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildBookingList(_bookings),
                      _buildBookingList(_getBusBookings()),
                      _buildBookingList(_getHotelBookings()),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingList(List<Booking> bookings) {
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

  // Mock data - replace with actual data from your backend
  List<Booking> _getMockBookings() {
    return [
      Booking(
        id: '67890abc',
        userId: 'user123',
        type: BookingType.bus,
        bookingDate: DateTime.now(),
        startDate: DateTime(2025, 10, 24),
        endDate: DateTime(2025, 10, 30),
        fromLocation: 'Phnom Penh',
        toLocation: 'Siem Reap',
        totalAmount: 25.0,
        status: BookingStatus.confirmed,
        busCompany: 'Mekong Express',
        seatNumber: 'A12',
      ),
      Booking(
        id: '67891def',
        userId: 'user123',
        type: BookingType.bus,
        bookingDate: DateTime.now(),
        startDate: DateTime(2025, 10, 24),
        endDate: DateTime(2025, 10, 30),
        fromLocation: 'Phnom Penh',
        toLocation: 'Siem Reap',
        totalAmount: 25.0,
        status: BookingStatus.completed,
        busCompany: 'Giant Ibis',
        seatNumber: 'B08',
      ),
      Booking(
        id: '67892ghi',
        userId: 'user123',
        type: BookingType.bus,
        bookingDate: DateTime.now(),
        startDate: DateTime(2025, 10, 24),
        endDate: DateTime(2025, 10, 30),
        fromLocation: 'Phnom Penh',
        toLocation: 'Siem Reap',
        totalAmount: 25.0,
        status: BookingStatus.completed,
        busCompany: 'Virak Buntham',
        seatNumber: 'C15',
      ),
      Booking(
        id: '67893jkl',
        userId: 'user123',
        type: BookingType.hotel,
        bookingDate: DateTime.now(),
        startDate: DateTime(2025, 11, 5),
        endDate: DateTime(2025, 11, 10),
        hotelName: 'Raffles Hotel Le Royal',
        roomType: 'Deluxe Suite',
        totalAmount: 450.0,
        status: BookingStatus.pending,
        numberOfGuests: 2,
      ),
    ];
  }

  List<Booking> _getBusBookings() {
    return _bookings
        .where((booking) => booking.type == BookingType.bus)
        .toList();
  }

  List<Booking> _getHotelBookings() {
    return _bookings
        .where((booking) => booking.type == BookingType.hotel)
        .toList();
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;

  const _BookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('View details for ${booking.displayId}')),
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
                booking.type == BookingType.bus
                    ? Icons.directions_bus
                    : Icons.hotel,
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
                    booking.displayId,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    booking.dateRange,
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: Colors.black,
                    ),
                  ),
                  Text(
                    booking.routeOrLocation,
                    style: DertamTextStyles.bodySmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                      color: Colors.black,
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
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.completed:
        return const Color(0xFFE4E6E8);
      case BookingStatus.confirmed:
        return const Color(0x6178F192); // rgba(120,241,146,0.38)
      case BookingStatus.pending:
        return const Color(0xFFFFF4E6);
      case BookingStatus.cancelled:
        return const Color(0xFFFFE6E6);
    }
  }

  String _getStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.confirmed:
        return 'Confirm';
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.cancelled:
        return 'Cancelled';
    }
  }
}
