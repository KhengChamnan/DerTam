import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/dertam_bus_booking_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/screen/hotel/dertam_hotel_screen.dart';
import 'package:mobile_frontend/ui/screen/profile/user_profile_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/dertam_trip_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class Navigationbar extends StatelessWidget {
  const Navigationbar({super.key, this.currentIndex = 0});

  final int currentIndex;

  void _navigateToScreen(BuildContext context, int index) {
    if (index == currentIndex) return;

    Widget screen;
    switch (index) {
      case 0:
        screen = HomePage();
        break;
      case 1:
        screen = const DertamBusBookingScreen();
        break;
      case 2:
        screen = const DertamTripScreen();
        break;
      case 3:
        screen = const DertamHotelScreen();
        break;
      case 4:
        screen = const UserProfile();
        break;
      default:
        return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.bottomCenter,
      children: [
        /// Main Navigation Bar
        Material(
          elevation: 10,
          shadowColor: Colors.black.withOpacity(0.2),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: DertamColors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: NavigationBar(
              height: 70,
              elevation: 0,
              backgroundColor: DertamColors.white,
              indicatorColor: DertamColors.primaryBlue.withOpacity(0.1),
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              selectedIndex: currentIndex,
              destinations: [
                NavigationDestination(
                  icon: Icon(
                    Iconsax.home,
                    color: currentIndex == 0
                        ? DertamColors.primaryBlue
                        : Colors.grey,
                  ),
                  label: 'Home',
                ),

                NavigationDestination(
                  icon: Icon(
                    Iconsax.bus,
                    color: currentIndex == 1
                        ? DertamColors.primaryBlue
                        : Colors.grey,
                  ),
                  label: 'Bus Booking',
                ),
                NavigationDestination(
                  icon: Icon(
                    Icons.travel_explore,
                    color: currentIndex == 2
                        ? DertamColors.primaryBlue
                        : Colors.grey,
                  ),
                  label: 'Trip Plan',
                ),

                NavigationDestination(
                  icon: Icon(
                    Icons.hotel,
                    color: currentIndex == 3
                        ? DertamColors.primaryBlue
                        : Colors.grey,
                  ),
                  label: 'Hotel booking',
                ),
                NavigationDestination(
                  icon: Icon(
                    Iconsax.user,
                    color: currentIndex == 4
                        ? DertamColors.primaryBlue
                        : Colors.grey,
                  ),
                  label: 'Profile',
                ),
              ],
              onDestinationSelected: (int index) {
                _navigateToScreen(context, index);
              },
            ),
          ),
        ),
      ],
    );
  }
}
