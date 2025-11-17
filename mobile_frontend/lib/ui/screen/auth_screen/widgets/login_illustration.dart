import 'package:flutter/material.dart';
import '../../../theme/dertam_apptheme.dart';

///
/// Login illustration widget.
/// Displays the welcome illustration at the top of the login screen.
/// Shows a fallback icon if the image fails to load.
///
class LoginIllustration extends StatelessWidget {
  final double height;

  const LoginIllustration({super.key, this.height = 200});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Image.asset(
        'assets/images/dertam_logo.png',
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          // Fallback if image not found
          return Container(
            height: height,
            decoration: BoxDecoration(
              color: DertamColors.primaryDark.withOpacity(0.1),
              borderRadius: BorderRadius.circular(DertamSpacings.radius),
            ),
            child: Center(
              child: Icon(
                Icons.image,
                size: 80,
                color: DertamColors.primaryDark.withOpacity(0.3),
              ),
            ),
          );
        },
      ),
    );
  }
}
