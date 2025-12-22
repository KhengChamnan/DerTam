import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_buses_card.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_select_seat.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';
import 'package:provider/provider.dart';

class DertamAvailableBusesScreen extends StatefulWidget {
  final ProvinceCategoryDetail? fromLocation;
  final ProvinceCategoryDetail? toLocation;
  final DateTime date;

  const DertamAvailableBusesScreen({
    super.key,
    required this.fromLocation,
    required this.toLocation,
    required this.date,
  });

  @override
  State<DertamAvailableBusesScreen> createState() =>
      _DertamAvailableBusesScreenState();
}

class _DertamAvailableBusesScreenState
    extends State<DertamAvailableBusesScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch recommended places and upcoming events when the page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final busBooking = context.read<BusBookingProvider>();
      busBooking.fetchBusSchedul(
        widget.fromLocation?.provinceCategoryID ?? 0,
        widget.toLocation?.provinceCategoryID ?? 0,
        widget.date,
      );
    });
  }

  String _formatDateDisplay() {
    try {
      // Parse the date string (assuming format like "2024-12-08" or "08/12/2024")
      DateTime parsedDate;
      if (widget.date.toString().contains('-')) {
        parsedDate = DateTime.parse(widget.date.toString());
      } else {
        // Handle other formats if needed
        parsedDate = DateFormat('dd/MM/yyyy').parse(widget.date.toString());
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
      return widget.date.toString();
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
    final authProvider = context.read<AuthProvider>();
    final userData = authProvider.userInfo;

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
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
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
                            userData.data?.name ?? 'Guest',
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
                          widget.fromLocation?.provinceCategoryName ?? 'From',
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
                          widget.toLocation?.provinceCategoryName ?? 'To',
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
              child: Consumer<BusBookingProvider>(
                builder: (context, placeProvider, child) {
                  final busScheduleState = placeProvider.busSchedule;
                  print(
                    'Here is the bus that available: ${(busScheduleState.data?.schedule?.isNotEmpty ?? false) ? busScheduleState.data!.schedule!.first.busName : "No data"}',
                  );

                  // Handle loading state
                  if (busScheduleState.state == AsyncValueState.loading) {
                    return Center(
                      child: CircularProgressIndicator(
                        color: DertamColors.primaryBlue,
                      ),
                    );
                  }
                  // Handle error state
                  if (busScheduleState.state == AsyncValueState.error) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.wifi_off_rounded,
                              size: 48,
                              color: Colors.red,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Lost connection. Failed to load bus schedules',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            SizedBox(height: 8),
                            ElevatedButton(
                              onPressed: () {
                                context
                                    .read<BusBookingProvider>()
                                    .fetchBusSchedul(
                                      widget.fromLocation?.provinceCategoryID ??
                                          0,
                                      widget.toLocation?.provinceCategoryID ??
                                          0,
                                      widget.date,
                                    );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: DertamColors.primaryBlue,
                              ),
                              child: Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Handle empty state
                  if (busScheduleState.state == AsyncValueState.empty ||
                      busScheduleState.data == null ||
                      busScheduleState.data?.schedule == null ||
                      (busScheduleState.data?.schedule?.isEmpty ?? true)) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.directions_bus_outlined,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            SizedBox(height: 16),
                            Text(
                              'No buses available',
                              style: DertamTextStyles.subtitle.copyWith(
                                color: Colors.grey[700],
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Try different locations or dates',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  // Handle success state
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 15),
                    itemCount: busScheduleState.data?.schedule?.length,
                    itemBuilder: (context, index) {
                      final schedules = busScheduleState.data?.schedule?[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: DertamBusesCard(
                          busName: schedules?.busName ?? 'Bus Name',
                          busType: schedules?.busType ?? 'AC',
                          departureTime: schedules?.departureTime ?? '',
                          arrivalTime: schedules?.arrivalTime ?? '',
                          duration: schedules?.duration ?? '',
                          price: schedules?.price ?? '',
                          seatsLeft: schedules?.availableSeats ?? 0,
                          fromLocation: schedules?.fromLocation ?? 'From',
                          toLocation: schedules?.toLocation ?? 'To',
                          departureDate: schedules?.departureDate,
                          arrivalDate: schedules?.arrivalDate,
                          onTap: () {
                            Navigator.of(context).push(
                              AnimationUtils.leftToRight(
                                DertamSelectSeat(
                                  scheduleId: schedules?.id ?? '',
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
