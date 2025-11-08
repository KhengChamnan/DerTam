import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/forgot_password/forgot_password_screen.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/register/dertam_register_screen.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
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

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Handles sign in button press
  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    // Get auth provider
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call login method
    await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    // Check result after login
    if (!mounted) return;

    final loginValue = authProvider.loginValue;

    if (loginValue?.state == AsyncValueState.success) {
      // Success - Show message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(loginValue!.data!.name),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomePage()),
      );
    } else if (loginValue?.state == AsyncValueState.error) {
      // Error - Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(loginValue!.error.toString()),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Handles forgot password
  void _handleForgotPassword() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
    );
  }

  /// Handles Google sign in
  Future<void> _handleGoogleSignIn() async {
    // Get auth provider
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call Google sign in method
    await authProvider.googleSignIn();

    // Check result after Google sign in
    if (!mounted) return;

    final googleSignInValue = authProvider.googleSignInValue;

    if (googleSignInValue?.state == AsyncValueState.success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomePage()),
      );
    } else if (googleSignInValue?.state == AsyncValueState.error) {
      // Error - Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(googleSignInValue!.error.toString()),
          backgroundColor: Colors.red,
        ),
      );
    }
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
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      final isLoading =
                          authProvider.loginValue?.state ==
                          AsyncValueState.loading;

                      return DertamButton(
                        text: 'Sign in',
                        onPressed: () => _handleSignIn(),
                        backgroundColor: DertamColors.primaryDark,
                        isLoading: isLoading,
                      );
                    },
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
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      final isGoogleLoading =
                          authProvider.googleSignInValue?.state ==
                          AsyncValueState.loading;

                      return LoginGoogleButton(
                        onTap: isGoogleLoading ? () {} : _handleGoogleSignIn,
                      );
                    },
                  ),

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
