import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_edit_profile.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_setting_screen.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_booking_screen.dart';
import 'package:provider/provider.dart';
import '../../theme/dertam_apptheme.dart';

class UserProfile extends StatelessWidget {
  const UserProfile({super.key});
  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final userData = authProvider.userInfo;
    Widget userInfo;
    switch (userData.state) {
      case AsyncValueState.loading:
        userInfo = const Center(child: CircularProgressIndicator());
        break;
      case AsyncValueState.error:
        userInfo = Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red),
              SizedBox(height: 16),
              Text(
                'Lost connection. Failed to load user infomation',
                style: TextStyle(color: Colors.grey[600]),
              ),
              SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => authProvider.getUserInfo(),
                child: Text('Retry'),
              ),
            ],
          ),
        );
        break;
      case AsyncValueState.empty:
        userInfo = Center(
          child: Text('Welcome, ${userData.data?.name ?? 'User'}'),
        );
        break;
      case AsyncValueState.success:
        userInfo = Center(
          child: Column(
            children: [
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(9999),
                  image: DecorationImage(
                    image: userData.data?.imageUrl?.isNotEmpty == true
                        ? NetworkImage(userData.data?.imageUrl ?? '')
                        : AssetImage('assets/images/dertam_logo.png')
                              as ImageProvider,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // User Name
              Text(
                userData.data?.name ?? 'User not Available',
                style: DertamTextStyles.subtitle.copyWith(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                  color: DertamColors.primaryBlue,
                  fontSize: 24,
                ),
              ),
            ],
          ),
        );
        break;
    }
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
          'Profile',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
            fontSize: 24,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 16),

                  /// User infomation
                  userInfo,
                  const SizedBox(height: 28),
                  // Menu Items
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: Column(
                      children: [
                        _ProfileMenuItem(
                          icon: Icons.history,
                          iconColor: DertamColors.primaryBlue,
                          title: 'My Booking',
                          subtitle: 'History of Your Booking',
                          onTap: () {
                            // Navigate to My Booking
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) =>
                                    const DertamBookingScreen(),
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 11),
                        _ProfileMenuItem(
                          icon: Icons.change_circle,
                          iconColor: DertamColors.primaryBlue,
                          title: 'Change Profile',
                          subtitle: 'You can update your info',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DertamEditProfile(),
                            ),
                          ),
                        ),
                        const SizedBox(height: 11),
                        _ProfileMenuItem(
                          icon: Icons.settings,
                          iconColor: DertamColors.primaryBlue,
                          title: 'Setting',
                          subtitle: 'Edit profile, language switching....',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const DertamSettingScreen(),
                            ),
                          ),
                        ),
                        const SizedBox(height: 30),
                        // Log out button
                        DertamButton(
                          text: 'Log out',

                          onPressed: () => showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return AlertDialog(
                                title: const Text('Log out'),
                                content: const Text(
                                  'Are you sure you want to log out?',
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: const Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      authProvider.logout();
                                      Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              DertamLoginScreen(),
                                        ),
                                      );
                                    },
                                    child: const Text(
                                      'Log out',
                                      style: TextStyle(color: Colors.red),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Navigationbar(currentIndex: 4),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: DertamColors.white,
          border: Border.all(color: const Color(0xFFDAD9DB), width: 1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 16),
            // Title and Subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DertamColors.black,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: DertamTextStyles.labelSmall.copyWith(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w400,
                      color: DertamColors.black,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            // Arrow
            Transform.rotate(
              angle: 3.14159, // 180 degrees in radians
              child: Icon(
                Icons.arrow_back_ios,
                size: 12,
                color: DertamColors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
