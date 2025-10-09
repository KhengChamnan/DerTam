import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_text_field.dart';
import 'package:mobile_frontend/utils/validation.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final String email='dadwa@gmail.com';
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button
              Padding(
                padding: const EdgeInsets.only(
                  top: DertamSpacings.l,
                  bottom: DertamSpacings.xl,
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.48),
                    borderRadius: BorderRadius.circular(14.217),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    iconSize: 24,
                    color: DertamColors.black,
                    onPressed: () => Navigator.pop(context),
                    padding: const EdgeInsets.all(9.478),
                  ),
                ),
              ),

              const SizedBox(height: DertamSpacings.xxl * 3),

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
              //Send Button
              DertamButton(
                text: 'Send',
                onPressed: _handleResetPassword,
                backgroundColor: DertamColors.primaryDark,
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
            ],
          ),
        ),
      ),
    );
  }

  void _handleResetPassword() {
    if (Validation.validatePassword(_passwordController.text) == null &&
        _passwordController.text == _confirmPasswordController.text) {
            Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const HomeScreen()),
    );
  } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid password and ensure both fields match.')),
      );
    }} 
  }