import 'package:flutter/material.dart';

class AuthErrorDialog {
  /// Shows an error dialog for authentication issues
  static Future<void> showErrorDialog({
    required BuildContext context,
    required String title,
    required String message,
    String buttonText = 'OK',
  }) async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // User must tap button to dismiss
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
            textAlign: TextAlign.center,
          ),
          content: Text(
            message,
            style: const TextStyle(fontSize: 14, color: Colors.black87),
            textAlign: TextAlign.center,
          ),
          actions: [
            
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  buttonText,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  /// Shows a login error dialog
  static Future<void> showLoginError({
    required BuildContext context,
    String? customMessage,
  }) async {
    return showErrorDialog(
      context: context,
      title: 'Login Error',
      message: customMessage ?? 'Invalid email or password. Please try again.',
    );
  }

  /// Shows a registration error dialog
  static Future<void> showRegistrationError({
    required BuildContext context,
    String? customMessage,
  }) async {
    return showErrorDialog(
      context: context,
      title: 'Registration Error',
      message:
          customMessage ??
          'There was a problem creating your account. Please try again.',
    );
  }

  /// Shows a network error dialog
  static Future<void> showNetworkError({required BuildContext context}) async {
    return showErrorDialog(
      context: context,
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
    );
  }

  /// Shows a validation error dialog
  static Future<void> showValidationError({
    required BuildContext context,
    required String message,
  }) async {
    return showErrorDialog(
      context: context,
      title: 'Validation Error',
      message: message,
    );
  }
}

/// Widget version of the error dialog for more flexibility
class AuthErrorDialogWidget extends StatelessWidget {
  final String title;
  final String message;
  final String buttonText;
  final VoidCallback? onPressed;

  const AuthErrorDialogWidget({
    super.key,
    required this.title,
    required this.message,
    this.buttonText = 'OK',
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.red,
        ),
        textAlign: TextAlign.center,
      ),
      content: Text(
        message,
        style: const TextStyle(fontSize: 14, color: Colors.black87),
        textAlign: TextAlign.center,
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onPressed ?? () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              buttonText,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),
        ),
      ],
    );
  }
}
