import 'package:flutter/material.dart';
import '../../../theme/dertam_apptheme.dart';

///
/// Edit User Info Screen
/// Allows users to edit their profile information including name, phone, and email
///
class DertamEditUserInfo extends StatefulWidget {
  const DertamEditUserInfo({super.key});

  @override
  State<DertamEditUserInfo> createState() => _DertamEditUserInfoState();
}

class _DertamEditUserInfoState extends State<DertamEditUserInfo> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    // Initialize with sample data
    _nameController.text = 'hi.k';
    _phoneController.text = '+855 1234569';
    _emailController.text = 'hi.k';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    if (_formKey.currentState?.validate() ?? false) {
      // TODO: Implement save logic
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: IconButton(
            icon: Icon(
              Icons.arrow_back_ios,
              color: DertamColors.black,
              size: 24,
            ),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        title: Text(
          'Edit Profile',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            color: DertamColors.black,
            fontSize: 20,
          ),
        ),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 32),

                // Name Field
                Text(
                  'Name',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _nameController,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFABABAB),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFFABABAB),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your name';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 28),

                // Phone Number Field
                Text(
                  'Phone Number',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFABABAB),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.phone_outlined,
                          color: const Color(0xFFABABAB),
                          size: 24,
                        ),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFFABABAB),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your phone number';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 28),

                // Email Field
                Text(
                  'Your Email',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF262422),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: DertamColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFF1ECEC),
                      width: 1,
                    ),
                  ),
                  child: TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFABABAB),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.mail_outline,
                          color: const Color(0xFFABABAB),
                          size: 24,
                        ),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFFABABAB),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 360),

                // Save Button
                Container(
                  width: double.infinity,
                  height: 53,
                  decoration: BoxDecoration(
                    color: const Color(0xFF02015C),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _saveProfile,
                      borderRadius: BorderRadius.circular(20),
                      child: Center(
                        child: Text(
                          'Save',
                          style: DertamTextStyles.subtitle.copyWith(
                            fontFamily: 'Roboto',
                            fontWeight: FontWeight.w500,
                            color: DertamColors.white,
                            fontSize: 20,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
