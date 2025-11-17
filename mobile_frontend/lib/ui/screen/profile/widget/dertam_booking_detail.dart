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
          _buildStatusCard(booking),
          const SizedBox(height: 20),

          // Booking Information
          _buildSectionTitle('Booking Information'),
          const SizedBox(height: 12),
          _buildInfoCard(booking),
          const SizedBox(height: 20),

          // Room Details
          _buildSectionTitle('Room Details'),
          const SizedBox(height: 12),
          ...booking.bookingItems.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildRoomCard(item),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStatusCard(BookingItem booking) {
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

  Widget _buildSectionTitle(String title) {
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

  Widget _buildInfoCard(BookingItem booking) {
    final createdDate = DateTime.parse(booking.createdAt);
    final formattedDate = DateFormat(
      'MMM dd, yyyy • HH:mm',
    ).format(createdDate);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildInfoRow(Icons.badge_outlined, 'Booking ID', '#${booking.id}'),
          const Divider(height: 24),
          _buildInfoRow(Icons.person_outline, 'User ID', '#${booking.userId}'),
          const Divider(height: 24),
          _buildInfoRow(
            Icons.calendar_today_outlined,
            'Booked Date',
            formattedDate,
          ),
          const Divider(height: 24),
          _buildInfoRow(
            Icons.check_circle_outline,
            'Status',
            _getStatusText(booking.status),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomCard(BookingItemDetail item) {
    final checkIn = DateTime.parse(item.hotelDetails.checkIn);
    final checkOut = DateTime.parse(item.hotelDetails.checkOut);
    final formattedCheckIn = DateFormat('MMM dd, yyyy').format(checkIn);
    final formattedCheckOut = DateFormat('MMM dd, yyyy').format(checkOut);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
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
                    color: Colors.grey[200],
                    child: Icon(Icons.hotel, size: 60, color: Colors.grey[400]),
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
                    _buildFeatureChip(
                      Icons.people_outline,
                      '${item.roomProperty.maxGuests} Guests',
                    ),
                    const SizedBox(width: 8),
                    _buildFeatureChip(
                      Icons.bed_outlined,
                      '${item.roomProperty.numberOfBed} Beds',
                    ),
                    const SizedBox(width: 8),
                    _buildFeatureChip(
                      Icons.straighten_outlined,
                      '${item.roomProperty.roomSize} m²',
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

  Widget _buildInfoRow(IconData icon, String label, String value) {
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

  Widget _buildFeatureChip(IconData icon, String label) {
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
