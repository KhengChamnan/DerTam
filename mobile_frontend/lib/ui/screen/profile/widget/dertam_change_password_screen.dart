import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../theme/dertam_apptheme.dart';

class DertamChangePasswordScreen extends StatefulWidget {
  const DertamChangePasswordScreen({super.key});

  @override
  State<DertamChangePasswordScreen> createState() =>
      _DertamChangePasswordScreenState();
}

class _DertamChangePasswordScreenState
    extends State<DertamChangePasswordScreen> {
  final TextEditingController _currentPasswordController =
      TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _saveProfile() async {
    if (_formKey.currentState?.validate() ?? false) {
      final authProvider = context.read<AuthProvider>();
      await authProvider.changePassword(
        _currentPasswordController.text,
        _newPasswordController.text,
        _confirmPasswordController.text,
      );
      if (mounted) {
        Navigator.pop(context);
      }
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
        title: Text(
          'Change Password',
          style: DertamTextStyles.subtitle.copyWith(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
            fontSize: 24,
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
                  'Current Password',
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
                    controller: _currentPasswordController,
                    obscureText: _obscureCurrentPassword,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.lock_outline,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureCurrentPassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: DertamColors.primaryBlue,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureCurrentPassword = !_obscureCurrentPassword;
                          });
                        },
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your current password';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Phone Number Field
                Text(
                  'New Password',
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
                    controller: _newPasswordController,
                    obscureText: _obscureNewPassword,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.lock_outline,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureNewPassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: DertamColors.primaryBlue,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureNewPassword = !_obscureNewPassword;
                          });
                        },
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a new password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Email Field
                Text(
                  'Confirm New Password',
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
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirmPassword,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w500,
                      color: DertamColors.primaryBlue,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Icon(
                          Icons.lock_outline,
                          color: DertamColors.primaryBlue,
                          size: 24,
                        ),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: DertamColors.primaryBlue,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          });
                        },
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 15,
                      ),
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w500,
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please confirm your new password';
                      }
                      if (value != _newPasswordController.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                  ),
                ),

                const SizedBox(height: 60),

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
