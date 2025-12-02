import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/models/place/upcoming_event_place.dart';

class EventCard extends StatelessWidget {
  final UpcomingEventPlace place;
  final VoidCallback onTap;

  const EventCard({super.key, required this.place, required this.onTap});
  String formatDateDisplay(String date) {
    if (date.isEmpty) {
      return '';
    }
    try {
      DateTime parsedDate;
      bool hasTime = false;

      // Handle different date formats
      if (date.contains('T')) {
        // ISO 8601 format: 2025-11-29T09:30:00.000000Z
        parsedDate = DateTime.parse(date);
        hasTime = true;
      } else if (date.contains(' ') && date.contains('-')) {
        // Backend format: 2025-12-10 14:00:00
        parsedDate = DateFormat('yyyy-MM-dd HH:mm:ss').parse(date);
        hasTime = true;
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

      // Format time if available (e.g., 2:00 PM)
      if (hasTime) {
        String time = DateFormat('h:mm a').format(parsedDate);
        return '$dayStr$suffix $month $year, $time';
      }

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

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 320,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(20),
                      bottom: Radius.circular(20),
                    ),
                    child: Image.network(
                      place.imageUrl ?? 'https://picsum.photos/400/600',
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 180,
                          width: double.infinity,
                          color: Colors.grey[200],
                          child: Icon(
                            Icons.event,
                            color: Colors.grey[400],
                            size: 40,
                          ),
                        );
                      },
                    ),
                  ),
                  // Like button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            spreadRadius: 0,
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.favorite_border,
                        color: Colors.grey,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Content
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event name
                  Text(
                    place.name ?? 'No Event Hosted',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1F1F1F),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Location and rating
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          formatDateDisplay(place.startDate.toString()),
                          style: const TextStyle(
                            color: Color(0xFF526B8C),
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        formatDateDisplay(place.endDate.toString()),
                        style: const TextStyle(
                          color: Color(0xFF1F1F1F),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
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
    );
  }
}
