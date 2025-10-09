import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/forgot_password/verify_pin_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/inputs/dertam_text_field.dart';
import 'package:mobile_frontend/utils/validation.dart';
import 'package:provider/provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();

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
                  'Forgot Password',
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
                    'Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.',
                    textAlign: TextAlign.center,
                    style: DertamTextStyles.body.copyWith(
                      fontSize: 14,
                      color: Colors.black.withOpacity(0.61),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: DertamSpacings.xxl),

              //Email Input Field
              DertamTextField(
                hintText: 'Email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                validator: Validation.validateEmail,
              ),
              const SizedBox(height: DertamSpacings.xl),
              //Send Button
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  final isLoading = authProvider.forgotPasswordValue?.state == AsyncValueState.loading;
                  
                  return DertamButton(
                    text: 'Send',
                    onPressed: () => _handleEmailVerification(),
                    backgroundColor: DertamColors.primaryDark,
                    isLoading: isLoading,
                  );
                },
              ),
              const SizedBox(height: DertamSpacings.xxl),
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

  Future<void> _handleEmailVerification() async {
    if (_emailController.text.isEmpty) return;

    // Get auth provider
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Call Email
    await authProvider.sendPasswordResetEmail(_emailController.text.trim());

    // Check result after login
    if (!mounted) return;

    final response = authProvider.forgotPasswordValue;

    if (response?.state == AsyncValueState.success) {
      // Success - Show message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response!.data!['message'] ?? 'Login successful'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => VerifyPinScreen(email: _emailController.text.trim())),
      );
    } else if (response?.state == AsyncValueState.error) {
      // Error - Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response!.error.toString()),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
