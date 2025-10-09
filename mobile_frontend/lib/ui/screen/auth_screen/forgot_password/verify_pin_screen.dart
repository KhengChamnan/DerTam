import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/forgot_password/reset_password_screen.dart';
import '../../../theme/dertam_apptheme.dart';

///
/// This screen allows users to:
/// - Enter the 6-digit verification code sent to their email
/// - Confirm the verification code to proceed
/// - Request a new code if they didn't receive it
///
class VerifyPinScreen extends StatefulWidget {
  const VerifyPinScreen({super.key});

  @override
  State<VerifyPinScreen> createState() => _VerifyPinScreenState();
}

class _VerifyPinScreenState extends State<VerifyPinScreen> {
  // Controllers for each PIN digit
  final List<TextEditingController> _controllers = List.generate(
    6,
    (index) => TextEditingController(),
  );
  
  // Focus nodes for each PIN digit
  final List<FocusNode> _focusNodes = List.generate(
    6,
    (index) => FocusNode(),
  );

  @override
  void dispose() {
    // Clean up controllers and focus nodes
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  /// Get the complete PIN from all text fields
  String get pin {
    return _controllers.map((controller) => controller.text).join();
  }

  /// Check if all PIN digits are filled
  bool get isPinComplete {
    return pin.length == 6;
  }

  /// Handle PIN confirmation
  void _handleConfirm() {
    if (isPinComplete) {
      // TODO: Implement PIN verification logic
      print('PIN entered: $pin');
      // Navigate to next screen or verify PIN
        Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ResetPasswordScreen()),
    );
    }
  }

  /// Handle resending the PIN
  void _handleResendPin() {
    // TODO: Implement resend PIN logic
    print('Resending PIN...');
  }

  /// Handle text change in a PIN field
  void _onPinChanged(int index, String value) {
    // Update UI to enable/disable confirm button
    setState(() {
      if (value.isNotEmpty && index < 5) {
        // Move to next field
        _focusNodes[index + 1].requestFocus();
      } else if (value.isEmpty && index > 0) {
        // Move to previous field on delete
        _focusNodes[index - 1].requestFocus();
      }
    });
  }

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
                  'Verify Email',
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
                  padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
                  child: Text(
                    'Please check your email and enter the 6-digit verification code below.',
                    textAlign: TextAlign.center,
                    style: DertamTextStyles.body.copyWith(
                      fontSize: 14,
                      color: Colors.black.withOpacity(0.61),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: DertamSpacings.xxl),
              
              // PIN input fields
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.s),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (index) {
                    return _buildPinField(index);
                  }),
                ),
              ),
              
              const SizedBox(height: DertamSpacings.xxl),
              
              // Confirm button
              Container(
                width: double.infinity,
                height: 53,
                decoration: BoxDecoration(
                  color: DertamColors.primaryDark,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: TextButton(
                  onPressed: isPinComplete ? _handleConfirm : null,
                  style: TextButton.styleFrom(
                    foregroundColor: DertamColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: Text(
                    'Confirm',
                    style: DertamTextStyles.subtitle.copyWith(
                      color: DertamColors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: DertamSpacings.l),
              
              // Resend PIN text
              Center(
                child: RichText(
                  text: TextSpan(
                    text: "Don't get the PIN ? ",
                    style: DertamTextStyles.body.copyWith(
                      fontSize: 14,
                      color: Colors.black.withOpacity(0.61),
                    ),
                    children: [
                      WidgetSpan(
                        child: GestureDetector(
                          onTap: _handleResendPin,
                          child: Text(
                            'Send again',
                            style: DertamTextStyles.body.copyWith(
                              fontSize: 14,
                              color: DertamColors.primaryDark,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build a single PIN input field
  Widget _buildPinField(int index) {
    return Container(
      width: 47,
      height: 53,
      decoration: BoxDecoration(
        color: DertamColors.white,
        border: Border.all(
          color: const Color(0xFFD9D9D9),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: TextField(
          controller: _controllers[index],
          focusNode: _focusNodes[index],
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          maxLength: 1,
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.black,
            fontWeight: FontWeight.bold,
          ),
          decoration: const InputDecoration(
            counterText: '',
            border: InputBorder.none,
            contentPadding: EdgeInsets.zero,
          ),
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
          ],
          onChanged: (value) => _onPinChanged(index, value),
          onTap: () {
            // Select all text when tapping
            _controllers[index].selection = TextSelection(
              baseOffset: 0,
              extentOffset: _controllers[index].text.length,
            );
          },
        ),
      ),
    );
  }
}