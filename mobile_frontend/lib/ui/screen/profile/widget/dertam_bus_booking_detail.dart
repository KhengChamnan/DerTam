import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/bus/bus_booking_api_response.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class BusBookingDetailScreen extends StatefulWidget {
  final String bookingId;

  const BusBookingDetailScreen({super.key, required this.bookingId});

  @override
  State<BusBookingDetailScreen> createState() => _BusBookingDetailScreenState();
}

class _BusBookingDetailScreenState extends State<BusBookingDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BusBookingProvider>().fetchBusBookingDetails(
        widget.bookingId,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final busBookingProvider = context.watch<BusBookingProvider>();
    final bookingDetailState = busBookingProvider.busBookingDetail;

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
          'Booking Details',
          style: DertamTextStyles.title.copyWith(
            fontFamily: 'Inter',
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: DertamColors.primaryDark,
          ),
        ),
        centerTitle: true,
      ),
      body: _buildBody(bookingDetailState),
    );
  }

  Widget _buildBody(AsyncValue<BusBookingDataResponse> bookingDetailState) {
    if (bookingDetailState.state == AsyncValueState.empty) {
      return const Center(child: Text('No data available'));
    } else if (bookingDetailState.state == AsyncValueState.loading) {
      return const Center(child: CircularProgressIndicator());
    } else if (bookingDetailState.state == AsyncValueState.error) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
            const SizedBox(height: 16),
            Text(
              'Error loading booking details',
              style: DertamTextStyles.body.copyWith(color: Colors.red[600]),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                context.read<BusBookingProvider>().fetchBusBookingDetails(
                  widget.bookingId,
                );
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    } else if (bookingDetailState.state == AsyncValueState.success &&
        bookingDetailState.data != null) {
      return _buildBookingContent(bookingDetailState.data!);
    }
    return const Center(child: Text('No data available'));
  }

  Widget _buildBookingContent(BusBookingDataResponse bookingData) {
    if (bookingData.bookings.isEmpty) {
      return const Center(child: Text('No booking found'));
    }
    final booking = bookingData.bookings.first;
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Booking Status Card
          _BookingStatusCard(booking: booking),
          const SizedBox(height: 20),

          // Journey Details
          _SectionTitle(title: 'Journey Details'),
          const SizedBox(height: 12),
          _JourneyCard(booking: booking),
          const SizedBox(height: 20),

          // Seat Details
          if (booking.seats.isNotEmpty) ...[
            _SectionTitle(title: 'Seat Details'),
            const SizedBox(height: 12),
            _SeatsCard(seats: booking.seats),
            const SizedBox(height: 20),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// Booking Status Card
class _BookingStatusCard extends StatelessWidget {
  final BusBooking booking;

  const _BookingStatusCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: DertamColors.buttonGradient3,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: DertamColors.primaryBlue.withOpacity(0.3),
            spreadRadius: 0,
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.directions_bus_rounded,
              size: 40,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Booking #${booking.bookingId}',
            style: DertamTextStyles.heading.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w700,
              fontSize: 22,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusBackgroundColor(booking.status),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _getStatusText(booking.status),
              style: DertamTextStyles.bodyMedium.copyWith(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${booking.currency} ${booking.totalAmount}',
            style: DertamTextStyles.heading.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w800,
              fontSize: 28,
              color: DertamColors.white,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusBackgroundColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green.withOpacity(0.8);
      case 'confirmed':
        return Colors.blue.withOpacity(0.8);
      case 'pending':
        return Colors.orange.withOpacity(0.8);
      case 'cancelled':
        return Colors.red.withOpacity(0.8);
      default:
        return Colors.white.withOpacity(0.3);
    }
  }

  String _getStatusText(String status) {
    if (status.isEmpty) return 'Unknown';
    return status[0].toUpperCase() + status.substring(1).toLowerCase();
  }
}

// Section Title Widget
class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: DertamTextStyles.title.copyWith(
        fontFamily: 'Inter',
        fontWeight: FontWeight.w700,
        fontSize: 18,
        color: DertamColors.primaryDark,
      ),
    );
  }
}

// Journey Card
class _JourneyCard extends StatelessWidget {
  final BusBooking booking;

  const _JourneyCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    final schedule = booking.schedule;
    final bus = booking.bus;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
        boxShadow: [
          BoxShadow(
            color: DertamColors.primaryBlue.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Bus Info
          if (bus != null) ...[
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: DertamColors.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    Icons.directions_bus,
                    color: DertamColors.primaryBlue,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bus.name,
                        style: DertamTextStyles.bodyMedium.copyWith(
                          fontFamily: 'Inter',
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          color: DertamColors.primaryDark,
                        ),
                      ),
                      Text(
                        'Plate: ${bus.plate}',
                        style: DertamTextStyles.bodySmall.copyWith(
                          fontFamily: 'Inter',
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: DertamColors.neutral,
                        ),
                      ),
                    ],
                  ),
                ),
                if (bus.type != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: DertamColors.primaryPurple.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      bus.type!,
                      style: DertamTextStyles.bodySmall.copyWith(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w500,
                        fontSize: 12,
                        color: DertamColors.primaryPurple,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),
          ],

          // Departure and Arrival Times
          if (schedule != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: DertamColors.backgroundLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Departure',
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                            color: DertamColors.neutral,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDateTime(schedule.departureTime),
                          style: DertamTextStyles.bodyMedium.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: DertamColors.primaryDark,
                          ),
                        ),
                        Text(
                          _formatTime(schedule.departureTime),
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                            color: DertamColors.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      Icons.arrow_forward,
                      color: DertamColors.primaryBlue,
                      size: 20,
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Arrival',
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                            color: DertamColors.neutral,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDateTime(schedule.arrivalTime),
                          style: DertamTextStyles.bodyMedium.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: DertamColors.primaryDark,
                          ),
                        ),
                        Text(
                          _formatTime(schedule.arrivalTime),
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                            color: DertamColors.primaryBlue,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _formatDateTime(String? dateTimeStr) {
    if (dateTimeStr == null || dateTimeStr.isEmpty) return 'N/A';
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('MMM dd, yyyy').format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }

  String _formatTime(String? dateTimeStr) {
    if (dateTimeStr == null || dateTimeStr.isEmpty) return '';
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('HH:mm').format(dateTime);
    } catch (e) {
      return '';
    }
  }
}

// Seats Card
class _SeatsCard extends StatelessWidget {
  final List<BookingSeat> seats;

  const _SeatsCard({required this.seats});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
        boxShadow: [
          BoxShadow(
            color: DertamColors.primaryBlue.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.event_seat, color: DertamColors.primaryBlue, size: 20),
              const SizedBox(width: 8),
              Text(
                '${seats.length} Seat(s) Booked',
                style: DertamTextStyles.bodyMedium.copyWith(
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: DertamColors.primaryDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: seats.map((seat) {
              return _SeatChip(seat: seat);
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// Seat Chip
class _SeatChip extends StatelessWidget {
  final BookingSeat seat;

  const _SeatChip({required this.seat});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: DertamColors.backgroundLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: DertamColors.primaryBlue.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: DertamColors.primaryBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.event_seat,
              color: DertamColors.primaryBlue,
              size: 20,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Seat ${seat.seatNumber}',
            style: DertamTextStyles.bodyMedium.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w600,
              fontSize: 13,
              color: DertamColors.primaryDark,
            ),
          ),
          Text(
            '\$${seat.price}',
            style: DertamTextStyles.bodySmall.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w600,
              fontSize: 12,
              color: DertamColors.primaryPurple,
            ),
          ),
        ],
      ),
    );
  }
}