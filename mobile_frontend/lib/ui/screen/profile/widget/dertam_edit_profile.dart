import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_change_password_screen.dart';
import 'package:mobile_frontend/ui/screen/profile/widget/dertam_edit_user_info.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DertamEditProfile extends StatefulWidget {
  const DertamEditProfile({super.key});

  @override
  State<DertamEditProfile> createState() => _DertamEditProfileState();
}

class _DertamEditProfileState extends State<DertamEditProfile> {
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    // Fetch user info when the screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().getUserInfo();
    });
  }

  /// Show bottom sheet to choose image source (camera or gallery)
  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: DertamColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Update Profile Picture',
                  style: DertamTextStyles.subtitle.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 20),
                ListTile(
                  leading: Container(
                    width: 45,
                    height: 45,
                    decoration: BoxDecoration(
                      color: DertamColors.primaryBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.camera_alt,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  title: const Text(
                    'Take a Photo',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: Container(
                    width: 45,
                    height: 45,
                    decoration: BoxDecoration(
                      color: DertamColors.primaryBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.photo_library,
                      color: DertamColors.primaryBlue,
                    ),
                  ),
                  title: const Text(
                    'Choose from Gallery',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Pick image from camera or gallery
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        // Show loading indicator
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => Center(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: DertamColors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: DertamColors.primaryBlue),
                    const SizedBox(height: 16),
                    const Text(
                      'Uploading image...',
                      style: TextStyle(fontFamily: 'Poppins', fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        // Upload the image to backend
        final authProvider = context.read<AuthProvider>();
        await authProvider.updateProfile(
          null, // name
          null, // email
          null, // phone
          null, // age
          null, // gender
          pickedFile, // profile image
        );

        // Close loading dialog
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Profile picture updated successfully!'),
              backgroundColor: DertamColors.primaryBlue,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error picking/uploading image: $e');
      // Close loading dialog if open
      if (mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Failed to update profile picture. Please try again.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final userData = authProvider.userInfo;
    Widget userInfo;
    switch (userData.state) {
      case AsyncValueState.loading:
        userInfo = const Center(child: CircularProgressIndicator());
        break;
      case AsyncValueState.error:
        userInfo = Center(child: Text('Error: ${userData.error}'));
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
              // Profile photo section
              Center(
                child: Stack(
                  children: [
                    // Profile image
                    Container(
                      width: 139,
                      height: 139,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.grey[300],
                        image: DecorationImage(
                          image: NetworkImage(
                            userData.data?.userPicture ??
                                'https://res.cloudinary.com/dd4hzavnw/image/upload/v1761235874/room_properties/emssdtl4jfv65qavecze.png',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    // Edit icon
                    Positioned(
                      right: 0,
                      bottom: 8,
                      child: GestureDetector(
                        onTap: _showImagePickerOptions,
                        child: Container(
                          width: 31,
                          height: 31,
                          decoration: BoxDecoration(
                            color: DertamColors.primaryBlue,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: DertamColors.white,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            Icons.camera_alt,
                            color: DertamColors.white,
                            size: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // User Name
              Text(
                userData.data?.name ?? 'User not Available',
                style: DertamTextStyles.subtitle.copyWith(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF262422),
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
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: DertamColors.primaryBlue.withOpacity(0.1),
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
        centerTitle: true,
        title: Text(
          'Update Profile',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
            fontSize: 24,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 16),
            userInfo,
            const SizedBox(height: 24),
            // Settings menu container
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13),
              child: Container(
                decoration: BoxDecoration(
                  color: DertamColors.white,
                  border: Border.all(color: const Color(0xFFE4E6E8), width: 1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    // Edit Profile
                    _SettingMenuItem(
                      icon: Icons.person_outline,
                      iconBackgroundColor: const Color(0xFFF5F5F5),
                      title: 'Edit Profile',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DertamEditUserInfo(),
                        ),
                      ),
                    ),
                    // Divider
                    Padding(
                      padding: const EdgeInsets.only(left: 17, right: 17),
                      child: Divider(
                        height: 1,
                        thickness: 1,
                        color: const Color(0xFFE4E6E8),
                      ),
                    ),
                    // Change Password
                    _SettingMenuItem(
                      icon: Icons.lock_outline,
                      iconBackgroundColor: const Color(0xFFF5F5F5),
                      title: 'Change Password',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DertamChangePasswordScreen(),
                        ),
                      ),
                    ),
                    // Divider
                    Padding(
                      padding: const EdgeInsets.only(left: 17, right: 17),
                      child: Divider(
                        height: 1,
                        thickness: 1,
                        color: const Color(0xFFE4E6E8),
                      ),
                    ),
                    // Language
                    _SettingMenuItemWithLanguage(
                      icon: Icons.language,
                      iconBackgroundColor: const Color(0xFFF5F5F5),
                      title: 'Language',
                      selectedLanguage: 'Khmer',
                      onTap: () {
                        // Navigate to language selection
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Widget for a setting menu item with icon, title, and arrow
class _SettingMenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconBackgroundColor;
  final String title;
  final VoidCallback onTap;

  const _SettingMenuItem({
    required this.icon,
    required this.iconBackgroundColor,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 18),
        child: Row(
          children: [
            // Icon container
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: iconBackgroundColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: DertamColors.black, size: 24),
            ),
            const SizedBox(width: 23),
            // Title
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
              ),
            ),
            // Arrow icon
            Transform.rotate(
              angle: 3.14, // 180 degrees
              child: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.black,
                size: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Widget for language menu item with flag
class _SettingMenuItemWithLanguage extends StatelessWidget {
  final IconData icon;
  final Color iconBackgroundColor;
  final String title;
  final String selectedLanguage;
  final VoidCallback onTap;

  const _SettingMenuItemWithLanguage({
    required this.icon,
    required this.iconBackgroundColor,
    required this.title,
    required this.selectedLanguage,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 18),
        child: Row(
          children: [
            // Icon container
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: iconBackgroundColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: DertamColors.black, size: 24),
            ),
            const SizedBox(width: 23),
            // Title
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                  letterSpacing: -0.24,
                ),
              ),
            ),
            // Selected language
            Text(
              selectedLanguage,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: Color(0xFF8B939F),
                letterSpacing: -0.24,
              ),
            ),
            const SizedBox(width: 10),
            // Flag icon (placeholder - you can replace with actual flag image)
            Container(
              width: 32,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
              child: Center(
                child: Text('🇰🇭', style: TextStyle(fontSize: 14)),
              ),
            ),
            const SizedBox(width: 10),
            // Dropdown arrow
            Icon(
              Icons.keyboard_arrow_down,
              color: DertamColors.black,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
