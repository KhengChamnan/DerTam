import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_available_buses.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_date_button.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_date_button_with_icon.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_location_picker.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_select_seat.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_upcoming_journey_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';
import 'package:provider/provider.dart';

class DertamBusBookingScreen extends StatefulWidget {
  const DertamBusBookingScreen({super.key});

  @override
  State<DertamBusBookingScreen> createState() => _DertamBusBookingScreenState();
}

class _DertamBusBookingScreenState extends State<DertamBusBookingScreen> {
  int selectedDateOption = 0;
  ProvinceCategoryDetail? fromLocation;
  ProvinceCategoryDetail? toLocation;
  DateTime? selectedDate;
  @override
  void initState() {
    super.initState();
    // Initialize selectedDate to today since "Today" is selected by default
    selectedDate = DateTime.now();
    // Fetch recommended places and upcoming events when the page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final busBooking = context.read<BusBookingProvider>();
      busBooking.fetchUpcomingJourney();
    });
  }

  // Navigate to location picker for selecting "from" location
  Future<void> _selectFromLocation() async {
    final ProvinceCategoryDetail? selectedLocation = await Navigator.of(context)
        .push<ProvinceCategoryDetail?>(
          AnimationUtils.bottomToTop(
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
    final ProvinceCategoryDetail? selectedLocation = await Navigator.of(context)
        .push<ProvinceCategoryDetail?>(
          AnimationUtils.bottomToTop(
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
              primary: DertamColors.primaryBlue,
              onPrimary: DertamColors.white,
              onSurface: DertamColors.primaryBlue,
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

  Future<void> _refreshData() async {
    final busProvider = context.read<BusBookingProvider>();
    final authProvider = context.read<AuthProvider>();

    // Fetch all data in parallel
    await Future.wait([
      busProvider.fetchUpcomingJourney(),
      authProvider.getUserInfo(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final userData = authProvider.userInfo;
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Padding(
          padding: const EdgeInsets.fromLTRB(15, 19, 15, 16),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(9999),
                  image: DecorationImage(
                    image: userData.data?.userPicture?.isNotEmpty == true
                        ? NetworkImage(userData.data?.userPicture ?? '')
                        : AssetImage('assets/images/dertam_logo.png')
                              as ImageProvider,
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
                          color: DertamColors.neutralLight,
                          height: 1.4,
                        ),
                      ),
                      Text(
                        userData.data?.name ?? 'User',
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
            ],
          ),
        ),
      ),
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with avatar and greeting
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
                              color: DertamColors.white,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  fromLocation?.provinceCategoryName ??
                                      'Boarding From',
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

                        // Swap button positioned between the two fields
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Column(
                              children: [
                                const SizedBox(height: 15),
                                // Where are you going field
                                GestureDetector(
                                  onTap: _selectToLocation,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 18,
                                    ),
                                    decoration: BoxDecoration(
                                      color: DertamColors.white,
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Row(
                                      children: [
                                        Text(
                                          toLocation?.provinceCategoryName ??
                                              'Where are you going?',
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
                              ],
                            ),

                            // Swap icon button - positioned absolutely
                            Positioned(
                              right: 0,
                              top: -14,
                              child: GestureDetector(
                                behavior: HitTestBehavior.opaque,
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
                                  child: Icon(
                                    Icons.swap_vert,
                                    color: DertamColors.primaryBlue,
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
                          onPressed: () async {
                            // Validate inputs
                            if (fromLocation == null || toLocation == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Please select both locations'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                              return;
                            }

                            if (selectedDate == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Please select a date'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                              return;
                            }

                            // Fetch bus schedules
                            try {
                              await context
                                  .read<BusBookingProvider>()
                                  .fetchBusSchedul(
                                    fromLocation?.provinceCategoryID ?? 0,
                                    toLocation?.provinceCategoryID ?? 0,
                                    selectedDate ?? DateTime.now(),
                                  );

                              // Navigate to results screen
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      DertamAvailableBusesScreen(
                                        fromLocation: fromLocation,
                                        toLocation: toLocation,
                                        date: selectedDate!,
                                      ),
                                ),
                              );
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Failed to search buses: $e'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          },
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
                    style: DertamTextStyles.subtitle.copyWith(
                      fontWeight: FontWeight.bold,
                      color: DertamColors.black,
                    ),
                  ),
                ),

                const SizedBox(height: 15),

                // Journey cards
                Consumer<BusBookingProvider>(
                  builder: (context, placeProvider, child) {
                    final upcomingJourney = placeProvider.upcomingJourneys;

                    // Handle loading state
                    if (upcomingJourney.state == AsyncValueState.loading) {
                      return SizedBox(
                        height: 200,
                        child: Center(
                          child: CircularProgressIndicator(
                            color: DertamColors.primaryBlue,
                          ),
                        ),
                      );
                    }
                    // Handle error state
                    if (upcomingJourney.state == AsyncValueState.error) {
                      return SizedBox(
                        height: 200,
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
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
                                  'Lost connection. Failed to load upcoming journey! Please check your connection!',
                                  style: TextStyle(color: Colors.grey[600]),
                                  textAlign: TextAlign.center,
                                ),
                                SizedBox(height: 8),
                                ElevatedButton(
                                  onPressed: () {
                                    context
                                        .read<BusBookingProvider>()
                                        .fetchUpcomingJourney();
                                  },
                                  child: Text('Retry'),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }

                    // Handle empty state
                    if (upcomingJourney.state == AsyncValueState.empty ||
                        upcomingJourney.data == null ||
                        upcomingJourney.data?.schedule == null ||
                        upcomingJourney.data!.schedule!.isEmpty) {
                      return SizedBox(
                        height: 200,
                        child: Center(
                          child: Text(
                            'No upcoming journeys available',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ),
                      );
                    }
                    // Handle success state
                    return ListView.builder(
                      padding: const EdgeInsets.only(bottom: 20),
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount: upcomingJourney.data?.schedule?.length ?? 0,
                      itemBuilder: (context, index) {
                        final journey = upcomingJourney.data?.schedule?[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: DertamUpcomingJourneyCard(
                            number: index + 1,
                            terminalName: journey?.busName ?? 'Bus Terminal',
                            from: journey?.fromLocation ?? 'N/A',
                            to: journey?.toLocation ?? 'N/A',
                            time: journey?.departureTime ?? 'N/A',
                            date: journey?.departureDate ?? 'N/A',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DertamSelectSeat(
                                  scheduleId: journey?.id ?? '',
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),

      bottomNavigationBar: Navigationbar(currentIndex: 1),
    );
  }
}
