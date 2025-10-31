import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_select_seat.dart';

class DertamBusesCard extends StatelessWidget {
  final String busName;
  final String busType;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final String price;
  final int seatsLeft;
  final bool isLowSeats;
  final String? fromLocation;
  final String? toLocation;
  final String? date;

  const DertamBusesCard({
    super.key,
    required this.busName,
    required this.busType,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.price,
    required this.seatsLeft,
    required this.isLowSeats,
    this.fromLocation,
    this.toLocation,
    this.date,
  });

  int _extractPrice() {
    // Extract numeric value from price string (e.g., "LKR 200" -> 200)
    return int.tryParse(price.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DertamSelectSeat(
              fromLocation: fromLocation ?? 'From Location',
              toLocation: toLocation ?? 'To Location',
              date: date ?? 'Date',
              busName: busName,
              busType: busType,
              departureTime: departureTime,
              arrivalTime: arrivalTime,
              duration: duration,
              pricePerSeat: _extractPrice(),
              seatsLeft: seatsLeft,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE0E0E0), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
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
                  price,
                  style: DertamTextStyles.title.copyWith(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFFF5A522),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Time and duration
            Row(
              children: [
                // Departure time
                Text(
                  departureTime,
                  style: DertamTextStyles.bodySmall.copyWith(
                    color: Colors.black,
                  ),
                ),

                const SizedBox(width: 8),

                // Separator line
                Container(width: 10, height: 2, color: const Color(0xFF9E9E9E)),

                const SizedBox(width: 8),

                // Arrival time
                Text(
                  arrivalTime,
                  style: DertamTextStyles.bodySmall.copyWith(
                    color: const Color(0xFF616161),
                  ),
                ),

                const Spacer(),

                // Duration
                Text(
                  duration,
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: Colors.black,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Seats availability
            Text(
              '$seatsLeft Seats left',
              style: DertamTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w300,
                color: isLowSeats
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
