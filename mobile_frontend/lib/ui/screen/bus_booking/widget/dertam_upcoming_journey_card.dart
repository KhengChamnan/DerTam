import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamUpcomingJourneyCard extends StatelessWidget {
  final int number;
  final String terminalName;
  final String from;
  final String to;
  final String time;
  final String date;
  final VoidCallback? onTap;

  const DertamUpcomingJourneyCard({
    super.key,
    required this.number,
    required this.terminalName,
    required this.from,
    required this.to,
    required this.time,
    required this.date,
    this.onTap,
  });
  String formatDateDisplay(String date) {
    if (date.isEmpty) {
      return '';
    }
    try {
      DateTime parsedDate;
      // Handle different date formats
      if (date.contains('T')) {
        // ISO 8601 format: 2025-11-29T09:30:00.000000Z
        parsedDate = DateTime.parse(date);
      } else if (date.contains('.')) {
        // Format: 2025.11.29
        parsedDate = DateFormat('yyyy.MM.dd').parse(date);
      } else if (date.contains('-')) {
        // Format: 2025-11-29
        parsedDate = DateTime.parse(date);
      } else if (date.contains('/')) {
        // Format: 29/11/2025
        parsedDate = DateFormat('dd/MM/yyyy').parse(date);
      } else {
        return date;
      }
      // Get day with ordinal suffix
      int day = parsedDate.day;
      String suffix = _getOrdinalSuffix(day);
      String dayStr = day.toString().padLeft(2, '0');
      // Get month abbreviation
      String month = DateFormat('MMM').format(parsedDate);
      // Get year
      String year = parsedDate.year.toString();
      return '$dayStr$suffix - $month - $year';
    } catch (e) {
      // If parsing fails, return original format
      return date;
    }
  }

  String _getOrdinalSuffix(int day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

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

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          height: 120,
          decoration: BoxDecoration(
            color: DertamColors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: DertamColors.black.withOpacity(0.15),
                blurRadius: 16,
                offset: const Offset(0, 0),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Orange left accent
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 36,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFA9A47),
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(28),
                      bottomRight: Radius.circular(28),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      number.toString(),
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                right: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 160,
                  decoration: const BoxDecoration(
                    color: Color(0xFF01015B),
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(28),
                      bottomRight: Radius.circular(28),
                      bottomLeft: Radius.circular(28),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'departure time',
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatTime(time),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            fontFamily: 'Inter',
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formatDateDisplay(date),
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 56,
                top: 0,
                bottom: 0,
                right: 150,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      terminalName,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF565656),
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          'From : ',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB1B1B1),
                            fontFamily: 'Inter',
                          ),
                        ),
                        Text(
                          from,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w400,
                            color: Colors.black,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          'to : ',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB1B1B1),
                            fontFamily: 'Inter',
                          ),
                        ),
                        Text(
                          to,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w400,
                            color: Colors.black,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
