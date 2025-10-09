import 'package:flutter/material.dart';
import '../../../theme/dertam_apptheme.dart';

///
/// Google sign-in button widget.
/// Displays a circular button with Google logo.
/// Shows a fallback icon if the logo fails to load.
///
class LoginGoogleButton extends StatelessWidget {
  final VoidCallback onTap;
  final double size;

  const LoginGoogleButton({super.key, required this.onTap, this.size = 50});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: DertamColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Image.asset(
            'assets/images/google_logo.png',
            width: size * 0.6, // 60% of button size
            height: size * 0.6,
            errorBuilder: (context, error, stackTrace) {
              // Fallback Google icon
              return Icon(
                Icons.g_mobiledata,
                size: size * 0.7, // 70% of button size
                color: DertamColors.primaryDark,
              );
            },
          ),
        ),
      ),
    );
  }
}
