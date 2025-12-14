import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/widgets/login_illustration.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_text_field.dart';
import 'package:mobile_frontend/utils/validation.dart';
import 'package:provider/provider.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
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

                // Illustration
                const LoginIllustration(),

                SizedBox(height: DertamSpacings.s),

                // Title
                Center(
                  child: Text(
                    'Reset Password',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(height: DertamSpacings.l),

                // Description
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: DertamSpacings.m,
                    ),
                    child: Text(
                      'Enter your new password and confirm it to reset your account password',
                      textAlign: TextAlign.center,
                      style: DertamTextStyles.body.copyWith(
                        fontSize: 14,
                        color: Colors.black.withOpacity(0.61),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: DertamSpacings.xxl),
                DertamTextField(
                  hintText: 'Password',
                  controller: _passwordController,
                  isPassword: true,
                  validator: Validation.validatePassword,
                ),
                SizedBox(height: DertamSpacings.xs),
                DertamTextField(
                  hintText: 'Confirm Password',
                  controller: _confirmPasswordController,
                  isPassword: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: DertamSpacings.xxl),
                //Reset Password Button
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    final isLoading =
                        authProvider.resetPasswordValue?.state ==
                        AsyncValueState.loading;

                    return DertamButton(
                      text: 'Reset Password',
                      onPressed: () => _handleResetPassword(),
                      backgroundColor: DertamColors.primaryDark,
                      isLoading: isLoading,
                    );
                  },
                ),
                const SizedBox(height: DertamSpacings.xl),
                //Go Back
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Remember Your password? ",
                      style: DertamTextStyles.bodyMedium.copyWith(
                        color: Colors.black.withOpacity(0.61),
                        fontFamily: 'Roboto',
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.pop(context);
                      },
                      child: Text(
                        'Go Back',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: DertamColors.primaryDark,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: DertamSpacings.l),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleResetPassword() async {
    if (_passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      return;
    }

    // Get auth provider
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call login method
    await authProvider.resetPassword(
      widget.email,
      _passwordController.text,
      _confirmPasswordController.text,
    );

    // Check result after login
    if (!mounted) return;

    final resetPasswordValue = authProvider.resetPasswordValue;

    if (resetPasswordValue?.state == AsyncValueState.success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => DertamLoginScreen()),
      );
    } else if (resetPasswordValue?.state == AsyncValueState.error) {
      // Error - Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(resetPasswordValue!.error.toString()),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
