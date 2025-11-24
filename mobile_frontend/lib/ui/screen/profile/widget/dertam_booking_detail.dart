import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/booking/hotel_booking_list_response.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class DertamBookingDetailScreen extends StatefulWidget {
  final String bookingId;

  const DertamBookingDetailScreen({super.key, required this.bookingId});

  @override
  State<DertamBookingDetailScreen> createState() =>
      _DertamBookingDetailScreenState();
}

class _DertamBookingDetailScreenState extends State<DertamBookingDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HotelProvider>().fetchHotelBookingDetail(widget.bookingId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final bookingDetailState = hotelProvider.hotelBookingDetail;

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

  Widget _buildBody(bookingDetailState) {
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
                context.read<HotelProvider>().fetchHotelBookingDetail(
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
      return _buildBookingContent(bookingDetailState.data);
    }
    return const Center(child: Text('No data available'));
  }

  Widget _buildBookingContent(BookingDetailResponse bookingResponse) {
    // The API now returns a single booking item directly
    final booking = bookingResponse.data;
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Booking Status Card
          _BookingStatusCard(booking: booking),
          const SizedBox(height: 20),
          // Booking Information
          _SectionTitle(title: 'Booking Information'),
          const SizedBox(height: 12),
          _BookingInfoCard(booking: booking),
          const SizedBox(height: 20),

          // Room Details
          _SectionTitle(title: 'Room Details'),
          const SizedBox(height: 12),
          ...booking.bookingItems.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _RoomDetailCard(item: item),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// Private reusable stateless widgets

class _BookingStatusCard extends StatelessWidget {
  final BookingItem booking;

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
          Icon(_getStatusIcon(booking.status), size: 50, color: Colors.white),
          const SizedBox(height: 12),
          Text(
            'Booking #${booking.id}',
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
              color: Colors.white.withOpacity(0.3),
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
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Icons.check_circle;
      case 'confirmed':
        return Icons.verified;
      case 'pending':
        return Icons.hourglass_empty;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }

  String _getStatusText(String status) {
    return status[0].toUpperCase() + status.substring(1).toLowerCase();
  }
}

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

class _BookingInfoCard extends StatelessWidget {
  final BookingItem booking;

  const _BookingInfoCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    final createdDate = DateTime.parse(booking.createdAt);
    final formattedDate = DateFormat(
      'MMM dd, yyyy • HH:mm',
    ).format(createdDate);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DertamColors.white, width: 1),
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
          _InfoRow(
            icon: Icons.badge_outlined,
            label: 'Booking ID',
            value: '#${booking.id}',
          ),
          const Divider(height: 24),
          _InfoRow(
            icon: Icons.calendar_today_outlined,
            label: 'Booked Date',
            value: formattedDate,
          ),
          const Divider(height: 24),
          _InfoRow(
            icon: Icons.check_circle_outline,
            label: 'Status',
            value: _getStatusText(booking.status),
          ),
        ],
      ),
    );
  }

  String _getStatusText(String status) {
    return status[0].toUpperCase() + status.substring(1).toLowerCase();
  }
}

class _RoomDetailCard extends StatelessWidget {
  final BookingItemDetail item;
  const _RoomDetailCard({required this.item});
  @override
  Widget build(BuildContext context) {
    final checkIn = DateTime.parse(item.hotelDetails.checkIn);
    final checkOut = DateTime.parse(item.hotelDetails.checkOut);
    final formattedCheckIn = DateFormat('MMM dd, yyyy').format(checkIn);
    final formattedCheckOut = DateFormat('MMM dd, yyyy').format(checkOut);
    return Container(
      width: double.infinity,
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
          // Room Image
          if (item.roomProperty.imagesUrl.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
              child: Image.network(
                item.roomProperty.imagesUrl.first,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 180,
                    color: DertamColors.backgroundLight,
                    child: Icon(
                      Icons.hotel,
                      size: 60,
                      color: DertamColors.neutralLighter,
                    ),
                  );
                },
              ),
            ),

          // Room Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.roomProperty.roomType,
                  style: DertamTextStyles.title.copyWith(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                    color: DertamColors.primaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  item.roomProperty.roomDescription,
                  style: DertamTextStyles.bodySmall.copyWith(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w400,
                    fontSize: 13,
                    color: DertamColors.neutral,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),

                // Room Features
                Row(
                  children: [
                    _FeatureChip(
                      icon: Icons.people_outline,
                      label: '${item.roomProperty.maxGuests} Guests',
                    ),
                    const SizedBox(width: 8),
                    _FeatureChip(
                      icon: Icons.bed_outlined,
                      label: '${item.roomProperty.numberOfBed} Beds',
                    ),
                    const SizedBox(width: 8),
                    _FeatureChip(
                      icon: Icons.straighten_outlined,
                      label: '${item.roomProperty.roomSize} m²',
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Check-in/Check-out
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: DertamColors.backgroundLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Check-in',
                              style: DertamTextStyles.bodySmall.copyWith(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w500,
                                fontSize: 12,
                                color: DertamColors.neutral,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              formattedCheckIn,
                              style: DertamTextStyles.bodyMedium.copyWith(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                color: DertamColors.primaryDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward,
                        color: DertamColors.primaryBlue,
                        size: 20,
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Check-out',
                              style: DertamTextStyles.bodySmall.copyWith(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w500,
                                fontSize: 12,
                                color: DertamColors.neutral,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              formattedCheckOut,
                              style: DertamTextStyles.bodyMedium.copyWith(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                color: DertamColors.primaryDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Quantity and Price
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${item.hotelDetails.nights} night(s) × ${item.quantity} room(s)',
                      style: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                        color: DertamColors.neutral,
                      ),
                    ),
                    Text(
                      '\$${item.totalPrice}',
                      style: DertamTextStyles.title.copyWith(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: DertamColors.primaryBlue),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: DertamTextStyles.bodySmall.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w500,
              fontSize: 13,
              color: DertamColors.neutral,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            value,
            style: DertamTextStyles.bodyMedium.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: DertamColors.primaryDark,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _FeatureChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: DertamColors.backgroundLight,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: DertamColors.primaryBlue),
          const SizedBox(width: 4),
          Text(
            label,
            style: DertamTextStyles.bodySmall.copyWith(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w500,
              fontSize: 11,
              color: DertamColors.neutral,
            ),
          ),
        ],
      ),
    );
  }
}
