import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/screen/favorite/favorite_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/screen/profile/user_profile.dart';
import 'package:mobile_frontend/ui/screen/trip/trip_planning.dart';
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
        screen = const TripPlanning();
        break;
      case 2:
        screen = const TripPlanning();
        break;
      case 3:
        screen = const FavoriteScreen();
        break;
      case 4:
        screen = const UserProfile();
        break;
      default:
        return;
    }

    Navigator.push(context, MaterialPageRoute(builder: (context) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.bottomCenter,
      children: [
        // Main Navigation Bar
        Container(
          decoration: BoxDecoration(
            color: DertamColors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: NavigationBar(
            height: 70,
            elevation: 0,
            selectedIndex: currentIndex == 2
                ? 0
                : currentIndex > 2
                ? currentIndex - 1
                : currentIndex,
            backgroundColor: DertamColors.primaryBlue.withOpacity(0.05),
            indicatorColor: DertamColors.primaryBlue.withOpacity(0.2),
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
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
                  Iconsax.book,
                  color: currentIndex == 1
                      ? DertamColors.primaryBlue
                      : Colors.grey,
                ),
                label: 'Bus Booking',
              ),
              // Empty space for the floating button
              const NavigationDestination(icon: SizedBox(width: 60), label: ''),
              NavigationDestination(
                icon: Icon(
                  Iconsax.heart,
                  color: currentIndex == 3
                      ? DertamColors.primaryBlue
                      : Colors.grey,
                ),
                label: 'Favorite',
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
              // Adjust index for the empty space
              int actualIndex = index >= 2 ? index + 1 : index;
              _navigateToScreen(context, actualIndex);
            },
          ),
        ),
        // Floating Trip Plan Button
        Positioned(
          bottom: 20,
          child: GestureDetector(
            onTap: () => _navigateToScreen(context, 2),
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: DertamColors.primaryBlue.withOpacity(0.8),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: currentIndex == 2
                        ? DertamColors.primaryBlue
                        : Colors.black.withOpacity(0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(
                  color: currentIndex == 2
                      ? Colors.transparent
                      : Colors.grey.shade300,
                  width: 1.5,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Iconsax.folder,
                    color: currentIndex == 2 ? Colors.white : Colors.grey,
                    size: 30,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Trip Plan',
                    style: TextStyle(
                      color: currentIndex == 2 ? Colors.white : Colors.grey,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
