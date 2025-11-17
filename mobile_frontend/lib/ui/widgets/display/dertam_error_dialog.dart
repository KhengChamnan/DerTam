import 'package:flutter/material.dart';
import '../../theme/dertam_apptheme.dart';

/// A reusable error dialog widget that displays error messages
/// with a consistent design across the app
class DertamErrorDialog extends StatelessWidget {
  final String title;
  final String message;
  final String? buttonText;
  final VoidCallback? onPressed;

  const DertamErrorDialog({
    super.key,
    this.title = 'Error',
    required this.message,
    this.buttonText,
    this.onPressed,
  });

  /// Shows the error dialog
  static Future<void> show({
    required BuildContext context,
    String title = 'Error',
    required String message,
    String? buttonText,
    VoidCallback? onPressed,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => DertamErrorDialog(
        title: title,
        message: message,
        buttonText: buttonText,
        onPressed: onPressed,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DertamSpacings.radiusMedium),
      ),
      elevation: 8,
      backgroundColor: DertamColors.white,
      child: Padding(
        padding: EdgeInsets.all(DertamSpacings.l),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Error Icon
            Container(
              padding: EdgeInsets.all(DertamSpacings.m),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.error_outline, color: Colors.red, size: 48),
            ),

            SizedBox(height: DertamSpacings.m),

            // Title
            Text(
              title,
              style: DertamTextStyles.title.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 20,
                fontFamily: 'Roboto',
              ),
              textAlign: TextAlign.center,
            ),

            SizedBox(height: DertamSpacings.s),

            // Message
            Text(
              message,
              style: DertamTextStyles.bodyMedium.copyWith(
                color: Colors.black.withOpacity(0.7),
                fontFamily: 'Roboto',
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),

            SizedBox(height: DertamSpacings.l),

            // Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  onPressed?.call();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: DertamColors.primaryDark,
                  foregroundColor: DertamColors.white,
                  padding: EdgeInsets.symmetric(vertical: DertamSpacings.m),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(
                      DertamSpacings.radiusMedium,
                    ),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  buttonText ?? 'OK',
                  style: DertamTextStyles.button.copyWith(
                    color: DertamColors.white,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Roboto',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
