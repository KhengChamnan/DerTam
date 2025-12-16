import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamBusesCard extends StatelessWidget {
  final String busName;
  final String busType;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final String price;
  final String? departureDate;
  final String? arrivalDate;
  final int seatsLeft;
  final bool? isLowSeats;
  final String? fromLocation;
  final String? toLocation;
  final VoidCallback? onTap;

  const DertamBusesCard({
    super.key,
    required this.busName,
    required this.busType,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.price,
    required this.seatsLeft,
    this.isLowSeats,
    this.fromLocation,
    this.toLocation,
    this.onTap,
    this.departureDate,
    this.arrivalDate,
  });

  /// Formats a date string to a more readable format (e.g., "Nov 27, 2025")
  String _formatDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return '';
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }

  /// Formats time to 12-hour format with AM/PM (e.g., "08:30 AM")
  String _formatTime(String timeString) {
    try {
      // Handle various time formats
      if (timeString.contains(':')) {
        final parts = timeString.split(':');
        final hour = int.parse(parts[0]);
        final minute = parts.length > 1 ? parts[1] : '00';
        final period = hour >= 12 ? 'PM' : 'AM';
        final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
        return '$displayHour:$minute $period';
      }
      return timeString;
    } catch (e) {
      return timeString;
    }
  }

  /// Builds a formatted date-time widget for departure or arrival
  Widget _buildDateTimeInfo({
    required String label,
    required String time,
    String? date,
    required Color labelColor,
    required Color timeColor,
    required Color dateColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: DertamTextStyles.bodySmall.copyWith(
            color: labelColor,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _formatTime(time),
          style: DertamTextStyles.bodyMedium.copyWith(
            color: timeColor,
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        if (date != null && date.isNotEmpty) ...[
          const SizedBox(height: 2),
          Text(
            _formatDate(date),
            style: DertamTextStyles.bodySmall.copyWith(
              color: dateColor,
              fontWeight: FontWeight.w400,
              fontSize: 12,
            ),
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Color(0xFFE0E0E0), width: 1),
          boxShadow: [
            BoxShadow(
              color: DertamColors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Bus details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        busName,
                        style: DertamTextStyles.subtitle.copyWith(
                          fontSize: 18,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFF585656),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        busType,
                        style: DertamTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w300,
                          color: const Color(0xFF616161),
                        ),
                      ),
                    ],
                  ),
                ),

                // Price
                Text(
                  '\$$price/Seat',
                  style: DertamTextStyles.title.copyWith(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFFF5A522),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Time and duration section with improved layout
            Row(
              children: [
                // Departure info
                Expanded(
                  child: _buildDateTimeInfo(
                    label: 'Departure',
                    time: departureTime,
                    date: departureDate,
                    labelColor: const Color(0xFF757575),
                    timeColor: Colors.black,
                    dateColor: const Color(0xFF9E9E9E),
                  ),
                ),

                // Journey indicator
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    children: [
                      
                      Text(
                        '$duration hrs',
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF757575),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFFF5A522),
                                width: 2,
                              ),
                            ),
                          ),
                          Container(
                            width: 40,
                            height: 2,
                            color: const Color(0xFFE0E0E0),
                          ),
                          Icon(
                            Icons.directions_bus,
                            size: 16,
                            color: const Color(0xFFF5A522),
                          ),
                          Container(
                            width: 40,
                            height: 2,
                            color: const Color(0xFFE0E0E0),
                          ),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFFF5A522),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Arrival info
                Expanded(
                  child: _buildDateTimeInfo(
                    label: 'Arrival',
                    time: arrivalTime,
                    date: arrivalDate,
                    labelColor: const Color(0xFF757575),
                    timeColor: Colors.black,
                    dateColor: const Color(0xFF9E9E9E),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Seats availability
            Text(
              '$seatsLeft Seats left',
              style: DertamTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w300,
                color: (isLowSeats ?? false)
                    ? const Color(0xFFFA0C00) // Red for low seats
                    : const Color(0xFF43A047), // Green for available seats
              ),
            ),
          ],
        ),
      ),
    );
  }
}
