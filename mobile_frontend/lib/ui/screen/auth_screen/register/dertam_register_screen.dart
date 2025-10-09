import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/widgets/login_illustration.dart';
import 'package:mobile_frontend/utils/validation.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/inputs/dertam_text_field.dart';
import '../../../widgets/actions/dertam_button.dart';

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
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  /// Handles sign up button press
  void _handleSignup() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // TODO: Implement actual sign in logic
      Future.delayed(const Duration(seconds: 2), () {
        setState(() {
          _isLoading = false;
        });
        // Navigate to home screen or show error
      });
    }
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

                  // Email field
                  DertamTextField(
                    hintText: 'Name',
                    controller: _nameController,
                    keyboardType: TextInputType.name,
                  ),

                  SizedBox(height: DertamSpacings.m),

                  // Password field
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

                  // Sign in button
                  DertamButton(
                    text: 'Sign up',
                    onPressed: _handleSignup,
                    backgroundColor: DertamColors.primaryDark,
                    isLoading: _isLoading,
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

  void _handleAccountExist() {
    Navigator.pop(context);
  }
}
