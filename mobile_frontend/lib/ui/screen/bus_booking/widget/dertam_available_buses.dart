import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_buses_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:intl/intl.dart';

class DertamAvailableBusesScreen extends StatelessWidget {
  final String fromLocation;
  final String toLocation;
  final String date;

  const DertamAvailableBusesScreen({
    super.key,
    required this.fromLocation,
    required this.toLocation,
    required this.date,
  });

  String _formatDateDisplay() {
    try {
      // Parse the date string (assuming format like "2024-12-08" or "08/12/2024")
      DateTime parsedDate;
      if (date.contains('-')) {
        parsedDate = DateTime.parse(date);
      } else {
        // Handle other formats if needed
        parsedDate = DateFormat('dd/MM/yyyy').parse(date);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: Column(
          children: [
            // Header with back button and user greeting
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 16),
              child: Row(
                children: [
                  // Back button
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: const BoxDecoration(shape: BoxShape.circle),
                      child: const Icon(
                        Icons.arrow_back_ios_new,
                        size: 16,
                        color: Color(0xFF192588),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // User avatar
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: const DecorationImage(
                        image: NetworkImage(
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // User greeting
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Hello ',
                            style: DertamTextStyles.body.copyWith(
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF757575),
                            ),
                          ),
                          Text(
                            'Saduni Silva!',
                            style: DertamTextStyles.body.copyWith(
                              fontWeight: FontWeight.w400,
                              color: const Color(0xFF757575),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Where you want go',
                        style: DertamTextStyles.body.copyWith(
                          color: DertamColors.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Blue card with journey details
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 15),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: DertamColors.primaryDark,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Container(
                    height: 73,
                    width: 142,
                    decoration: const BoxDecoration(
                      image: DecorationImage(
                        image: AssetImage('assets/images/bus_logo.png'),
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Text(
                          fromLocation,
                          textAlign: TextAlign.center,
                          style: DertamTextStyles.subtitle.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Container(
                        width: 56,
                        height: 56,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Center(
                          child: RotatedBox(
                            quarterTurns: 1,
                            child: Icon(
                              Icons.swap_vertical_circle_sharp,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          toLocation,
                          textAlign: TextAlign.center,
                          style: DertamTextStyles.subtitle.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),
                  // Date display
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: const Color(0xFFEEEEEE),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      _formatDateDisplay(),
                      textAlign: TextAlign.center,
                      style: DertamTextStyles.body.copyWith(
                        color: const Color(0xFFEEEEEE),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // List of available buses
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 15),
                children: [
                  DertamBusesCard(
                    busName: 'Perera Travels',
                    busType: 'A/C Sleeper (2+2)',
                    departureTime: '9:00 AM',
                    arrivalTime: '9:45 AM',
                    duration: '45 Min',
                    price: 'LKR 200',
                    seatsLeft: 15,
                    isLowSeats: false,
                    fromLocation: fromLocation,
                    toLocation: toLocation,
                    date: _formatDateDisplay(),
                  ),
                  const SizedBox(height: 18),
                  DertamBusesCard(
                    busName: 'Gayan Express',
                    busType: 'A/C Sleeper (2+2)',
                    departureTime: '9:00 AM',
                    arrivalTime: '9:20 AM',
                    duration: '20 Min',
                    price: 'LKR 250',
                    seatsLeft: 2,
                    isLowSeats: true,
                    fromLocation: fromLocation,
                    toLocation: toLocation,
                    date: _formatDateDisplay(),
                  ),
                  const SizedBox(height: 18),
                  DertamBusesCard(
                    busName: 'Perera Travels',
                    busType: 'A/C Sleeper (2+2)',
                    departureTime: '9:00 AM',
                    arrivalTime: '9:45 AM',
                    duration: '45 Min',
                    price: 'LKR 200',
                    seatsLeft: 15,
                    isLowSeats: false,
                    fromLocation: fromLocation,
                    toLocation: toLocation,
                    date: _formatDateDisplay(),
                  ),
                  const SizedBox(height: 18),
                  DertamBusesCard(
                    busName: 'Gayan Express',
                    busType: 'A/C Sleeper (2+2)',
                    departureTime: '9:00 AM',
                    arrivalTime: '9:20 AM',
                    duration: '20 Min',
                    price: 'LKR 250',
                    seatsLeft: 2,
                    isLowSeats: true,
                    fromLocation: fromLocation,
                    toLocation: toLocation,
                    date: _formatDateDisplay(),
                  ),
                  const SizedBox(height: 18),
                  DertamBusesCard(
                    busName: 'Gayan Express',
                    busType: 'A/C Sleeper (2+2)',
                    departureTime: '9:00 AM',
                    arrivalTime: '9:20 AM',
                    duration: '20 Min',
                    price: 'LKR 250',
                    seatsLeft: 2,
                    isLowSeats: true,
                    fromLocation: fromLocation,
                    toLocation: toLocation,
                    date: _formatDateDisplay(),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
