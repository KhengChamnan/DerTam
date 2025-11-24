// ignore_for_file: deprecated_member_use, use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/widgets/login_illustration.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/utils/validation.dart';
import '../widgets/login_error.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/inputs/dertam_text_field.dart';
import '../../../widgets/actions/dertam_button.dart';

///
/// Register screen that allows users to:
/// - Create a new account with name, email, and password
/// - Navigate back to login screen if already have an account
///
class DertamRegisterScreen extends StatefulWidget {
  const DertamRegisterScreen({super.key});

  @override
  State<DertamRegisterScreen> createState() => _DertamRegisterScreenState();
}

class _DertamRegisterScreenState extends State<DertamRegisterScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  /// Handles sign up button press
  Future<void> _handleSignup() async {
    // Validate form first
    if (!_formKey.currentState!.validate()) {
      debugPrint('Form validation failed');
      // Show validation error dialog
      await AuthErrorDialog.showValidationError(
        context: context,
        message: 'Please fix the errors in the form before continuing.',
      );
      return;
    }

    // Additional password confirmation check
    if (_passwordController.text != _confirmPasswordController.text) {
      await AuthErrorDialog.showValidationError(
        context: context,
        message: 'Passwords do not match. Please check and try again.',
      );
      return;
    }

    // Debug: Print form values
    debugPrint('Name: ${_nameController.text.trim()}');
    debugPrint('Email: ${_emailController.text.trim()}');
    debugPrint('Password: ${_passwordController.text}');
    debugPrint('Confirm Password: ${_confirmPasswordController.text}');

    try {
      // Get auth provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      // Call register method
      await authProvider.register(
        _nameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text,
        _confirmPasswordController.text,
      );

      // Check result after registration
      if (!mounted) return;
      final registerValue = authProvider.registerValue;

      // Debug: Print register value state
      debugPrint('Register state: ${registerValue?.state}');
      debugPrint('Register data: ${registerValue?.data}');
      debugPrint('Register error: ${registerValue?.error}');

      if (registerValue?.state == AsyncValueState.success) {
        // Success - Show message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              registerValue!.data?.name ?? 'Registration successful',
            ),
            backgroundColor: Colors.green,
          ),
        );

        // Navigate to home screen
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => HomePage()),
          (route) => false,
        );
      } else if (registerValue?.state == AsyncValueState.error) {
        // Error - Show error dialog instead of SnackBar
        String errorMessage;
        // Check if error is a string or object
        if (registerValue!.error is String) {
          errorMessage = registerValue.error as String;
        } else {
          errorMessage = 'Registration failed. Please try again.';
        }

        // Show error dialog
        await AuthErrorDialog.showRegistrationError(
          context: context,
          customMessage: errorMessage,
        );
      }
    } catch (e) {
      // Handle any unexpected errors
      debugPrint('Unexpected error during registration: $e');
      await AuthErrorDialog.showNetworkError(context: context);
      return;
    }
  }

  /// Handle navigation back to login screen
  void _handleAccountExist() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => DertamLoginScreen()),
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: DertamSpacings.xl),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  SizedBox(height: DertamSpacings.xxl),

                  // Illustration
                  const LoginIllustration(),

                  SizedBox(height: DertamSpacings.xl),

                  // Register title
                  Text(
                    'Register',
                    style: DertamTextStyles.title.copyWith(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                    ),
                  ),

                  SizedBox(height: DertamSpacings.l),

                  // Name field
                  DertamTextField(
                    hintText: 'Name',
                    controller: _nameController,
                    keyboardType: TextInputType.name,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Please enter your name';
                      }
                      if (value.trim().length < 2) {
                        return 'Name must be at least 2 characters';
                      }
                      return null;
                    },
                  ),

                  SizedBox(height: DertamSpacings.m),

                  // Email field
                  DertamTextField(
                    hintText: 'Email',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    validator: Validation.validateEmail,
                  ),

                  SizedBox(height: DertamSpacings.xs),

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

                  SizedBox(height: DertamSpacings.xl),

                  // Sign up button
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      final isLoading =
                          authProvider.registerValue?.state ==
                          AsyncValueState.loading;

                      return DertamButton(
                        text: 'Sign up',
                        onPressed: () => _handleSignup(),
                        backgroundColor: DertamColors.primaryDark,
                        isLoading: isLoading,
                      );
                    },
                  ),

                  SizedBox(height: DertamSpacings.l),

                  //
                  // Register link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Already have an account ? ",
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: Colors.black.withOpacity(0.61),
                          fontFamily: 'Roboto',
                        ),
                      ),
                      GestureDetector(
                        onTap: _handleAccountExist,
                        child: Text(
                          'Sign in',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.primaryDark,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Roboto',
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: DertamSpacings.xl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
