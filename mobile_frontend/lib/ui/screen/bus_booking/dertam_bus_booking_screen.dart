import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/booking/location.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_available_buses.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_date_button.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_date_button_with_icon.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_location_picker.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_upcoming_journey_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';

class DertamBusBookingScreen extends StatefulWidget {
  const DertamBusBookingScreen({super.key});

  @override
  State<DertamBusBookingScreen> createState() => _DertamBusBookingScreenState();
}

class _DertamBusBookingScreenState extends State<DertamBusBookingScreen> {
  int selectedDateOption = 0;
  Location? fromLocation;
  Location? toLocation;
  DateTime? selectedDate;

  // Navigate to location picker for selecting "from" location
  Future<void> _selectFromLocation() async {
    final Location? selectedLocation = await Navigator.of(context)
        .push<Location?>(
          AnimationUtils.createBottomToTopRoute(
            DertamLocationPicker(initLocation: fromLocation),
          ),
        );

    if (selectedLocation != null) {
      setState(() {
        fromLocation = selectedLocation;
      });
    }
  }

  // Navigate to location picker for selecting "to" location
  Future<void> _selectToLocation() async {
    final Location? selectedLocation = await Navigator.of(context)
        .push<Location?>(
          AnimationUtils.createBottomToTopRoute(
            DertamLocationPicker(initLocation: toLocation),
          ),
        );

    if (selectedLocation != null) {
      setState(() {
        toLocation = selectedLocation;
      });
    }
  }

  // Swap from and to locations
  void _swapLocations() {
    setState(() {
      final temp = fromLocation;
      fromLocation = toLocation;
      toLocation = temp;
    });
  }

  // Show date picker for "Other" option
  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: const Color(0xFF01015b),
              onPrimary: Colors.white,
              onSurface: const Color(0xFF01015b),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != selectedDate) {
      setState(() {
        selectedDate = picked;
        selectedDateOption = 2; // Set to "Other" option
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with avatar and greeting
              Padding(
                padding: const EdgeInsets.fromLTRB(15, 19, 15, 0),
                child: Row(
                  children: [
                    // Avatar
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(9999),
                        image: const DecorationImage(
                          image: NetworkImage(
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),

                    const SizedBox(width: 12),

                    // Greeting text
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
                                height: 1.4,
                              ),
                            ),
                            Text(
                              'Saduni Silva!',
                              style: DertamTextStyles.body.copyWith(
                                fontWeight: FontWeight.w400,
                                color: const Color.fromARGB(255, 37, 30, 30),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Where you want go',
                          style: DertamTextStyles.body.copyWith(
                            color: DertamColors.primaryBlue,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Notification icon
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.notifications_outlined,
                        color: Color(0xFF212121),
                        size: 24,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Search card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: DertamColors.primaryDark,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      // Boarding From field
                      GestureDetector(
                        onTap: _selectFromLocation,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 18,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.91),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              Text(
                                fromLocation?.name ?? 'Boarding From',
                                style: DertamTextStyles.body.copyWith(
                                  fontWeight: fromLocation != null
                                      ? FontWeight.w500
                                      : FontWeight.w300,
                                  color: DertamColors.primaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 15),

                      // Swap button
                      Stack(
                        alignment: Alignment.centerRight,
                        children: [
                          // Where are you going field
                          GestureDetector(
                            onTap: _selectToLocation,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 18,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.91),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    toLocation?.name ?? 'Where are you going?',
                                    style: DertamTextStyles.body.copyWith(
                                      fontWeight: toLocation != null
                                          ? FontWeight.w500
                                          : FontWeight.w300,
                                      color: DertamColors.primaryDark,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Swap icon button
                          Transform.translate(
                            offset: const Offset(0, -37),
                            child: GestureDetector(
                              onTap: _swapLocations,
                              child: Container(
                                width: 58,
                                height: 58,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: RadialGradient(
                                    colors: [
                                      Color(0xFFFFFFFF),
                                      Color(0xFFE0E0E0),
                                    ],
                                  ),
                                ),
                                child: const Icon(
                                  Icons.swap_vert,
                                  color: Color(0xFF01015b),
                                  size: 28,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 15),

                      // Date selection buttons
                      Row(
                        children: [
                          DertamDateButton(
                            label: 'Today',
                            isSelected: selectedDateOption == 0,
                            onTap: () {
                              setState(() {
                                selectedDateOption = 0;
                                selectedDate = DateTime.now();
                              });
                            },
                          ),
                          const SizedBox(width: 12),
                          DertamDateButton(
                            label: 'Tomorrow',
                            isSelected: selectedDateOption == 1,
                            onTap: () {
                              setState(() {
                                selectedDateOption = 1;
                                selectedDate = DateTime.now().add(
                                  const Duration(days: 1),
                                );
                              });
                            },
                          ),
                          const SizedBox(width: 12),
                          DertamDateButtonWithIcon(
                            label: 'Other',
                            isSelected: selectedDateOption == 2,
                            onTap: _selectDate,
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      DertamButton(
                        text: 'Find Buses',
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => DertamAvailableBusesScreen(
                              fromLocation: fromLocation?.name ?? '',
                              toLocation: toLocation?.name ?? '',
                              date: selectedDate != null
                                  ? selectedDate.toString()
                                  : '',
                            ),
                          ),
                        ),
                        backgroundColor: DertamColors.white,
                        textColor: DertamColors.primaryBlue,
                        height: 50,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 30),
              // Upcoming Journey title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Upcoming Journey',
                  style: DertamTextStyles.body.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF001e39),
                  ),
                ),
              ),

              const SizedBox(height: 15),
              // Journey cards
              DertamUpcomingJourneyCard(
                number: 1,
                terminalName: 'Bus terminal 1',
                from: 'Kelaniya',
                to: 'Colombo',
                time: '9 AM , Sun',
                date: '2024.12.08',
              ),
              const SizedBox(height: 12),
              DertamUpcomingJourneyCard(
                number: 2,
                terminalName: 'Bus terminal 2',
                from: 'Biyagama',
                to: 'Kelaniya',
                time: '2 PM , Sun',
                date: '2024.12.08',
              ),
              const SizedBox(height: 12),
              DertamUpcomingJourneyCard(
                number: 3,
                terminalName: 'Bus terminal 3',
                from: 'Kelaniya',
                to: 'Colombo',
                time: '9 AM , Sun',
                date: '2024.12.08',
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Navigationbar(currentIndex: 1),
    );
  }
}
