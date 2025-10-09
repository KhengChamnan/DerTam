import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/forgot_password/forgot_password_screen.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/register/dertam_register_screen.dart';
import '../../../theme/dertam_apptheme.dart';
import '../../../widgets/inputs/dertam_text_field.dart';
import '../../../widgets/actions/dertam_button.dart';
import '../../../../utils/validation.dart';
import '../widgets/login_illustration.dart';
import '../widgets/login_google_button.dart';

///
/// Login screen that allows users to:
/// - Enter their email and password to sign in
/// - Toggle password visibility
/// - Navigate to forgot password screen
/// - Sign in with Google
/// - Navigate to registration screen
///
class DertamLoginScreen extends StatefulWidget {
  const DertamLoginScreen({super.key});

  @override
  State<DertamLoginScreen> createState() => _DertamLoginScreenState();
}

class _DertamLoginScreenState extends State<DertamLoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Handles sign in button press
  void _handleSignIn() {
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

  /// Handles forgot password
  void _handleForgotPassword() {
    // TODO: Navigate to forgot password screen
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
    );
  }

  /// Handles Google sign in
  void _handleGoogleSignIn() {
    // TODO: Implement Google sign in
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Google sign in coming soon')),
    );
  }

  /// Handles navigation to register screen
  void _handleRegister() {
    // TODO: Navigate to register screen
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const DertamRegisterScreen()),
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
                  
                  // Login title
                  Text(
                    'Log In',
                    style: DertamTextStyles.title.copyWith(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                    ),
                  ),
                  
                  SizedBox(height: DertamSpacings.l),
                  
                  // Email field
                  DertamTextField(
                    hintText: 'Email',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    validator: Validation.validateEmail,
                  ),
                  
                  SizedBox(height: DertamSpacings.m),
                  
                  // Password field
                  DertamTextField(
                    hintText: 'Password',
                    controller: _passwordController,
                    isPassword: true,
                    validator: Validation.validatePassword,
                  ),
                  
                  SizedBox(height: DertamSpacings.xs),
                  
                  // Forgot password link
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _handleForgotPassword,
                      child: Text(
                        'Forgot Password?',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: Colors.black.withOpacity(0.61),
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ),
                  ),
                  
                  SizedBox(height: DertamSpacings.s),
                  
                  // Sign in button
                  DertamButton(
                    text: 'Sign in',
                    onPressed: _handleSignIn,
                    backgroundColor: DertamColors.primaryDark,
                    isLoading: _isLoading,
                  ),
                  
                  SizedBox(height: DertamSpacings.l),
                  
                  // Or continue with
                  Text(
                    'Or Continue With',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.black.withOpacity(0.61),
                      fontFamily: 'Roboto',
                    ),
                  ),
                  
                  SizedBox(height: DertamSpacings.m),
                  
                  // Google sign in button
                  LoginGoogleButton(onTap: _handleGoogleSignIn),
                  
                  SizedBox(height: DertamSpacings.l),
                  
                  // Register link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Don't have an account ? ",
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: Colors.black.withOpacity(0.61),
                          fontFamily: 'Roboto',
                        ),
                      ),
                      GestureDetector(
                        onTap: _handleRegister,
                        child: Text(
                          'Register',
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