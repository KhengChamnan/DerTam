import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_setting_item.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamSettingScreen extends StatelessWidget {
  const DertamSettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: Icon(Icons.arrow_back_ios_new),
        ),
        centerTitle: true,
        title: Text('Settings'),
        backgroundColor: DertamColors.white,
      ),
      body: ListView(
        children: [
          DertamSettingItem(
            icon: Icons.person,
            title: 'Account Settings',
            onTap: () {}, // Navigate to account settings
          ),
          DertamSettingItem(
            icon: Icons.notifications,
            title: 'Notifications',
            onTap: () {}, // Navigate to notifications settings
          ),
          DertamSettingItem(
            icon: Icons.lock,
            title: 'Privacy & Security',
            onTap: () {}, // Navigate to privacy settings
          ),
          DertamSettingItem(
            icon: Icons.palette,
            title: 'App Preferences',
            onTap: () {}, // Navigate to preferences
          ),
          DertamSettingItem(
            icon: Icons.help_outline,
            title: 'Help & Support',
            onTap: () {}, // Navigate to help
          ),
        ],
      ),
    );
  }
}
