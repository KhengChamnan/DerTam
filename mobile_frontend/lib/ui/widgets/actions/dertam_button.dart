import 'package:flutter/material.dart';
import '../../theme/dertam_apptheme.dart';

///
/// A reusable button widget for DerTam app.
/// Supports solid colors and gradient backgrounds.
/// Provides consistent styling and behavior for all buttons.
///
class DertamButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isGradient;
  final bool isOutlined;
  final double? width;
  final double? height;
  final Color? backgroundColor;
  final Color? textColor;
  final LinearGradient? gradient;
  final bool isLoading;

  const DertamButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isGradient = false,
    this.isOutlined = false,
    this.width,
    this.height,
    this.backgroundColor,
    this.textColor,
    this.gradient,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final LinearGradient defaultGradient =
        gradient ?? DertamColors.buttonGradient2;
    final Color defaultBackgroundColor =
        backgroundColor ?? DertamColors.primaryDark;

    // Default text color
    final Color defaultTextColor = textColor ?? DertamColors.white;

    return Container(
      width: width ?? double.infinity,
      height: height ?? DertamSpacings.buttonHeight,
      decoration: BoxDecoration(
        gradient: isGradient ? defaultGradient : null,
        color: isGradient
            ? null
            : (isOutlined ? Colors.transparent : defaultBackgroundColor),
        borderRadius: BorderRadius.circular(20),
        border: isOutlined
            ? Border.all(color: DertamColors.primaryDark, width: 2)
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(20),
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        defaultTextColor,
                      ),
                    ),
                  )
                : Text(
                    text,
                    style: DertamTextStyles.button.copyWith(
                      color: isOutlined
                          ? DertamColors.primaryDark
                          : defaultTextColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}

///
/// A secondary button variant with outline style.
///
class DertamButtonOutlined extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final double? width;
  final double? height;

  const DertamButtonOutlined({
    super.key,
    required this.text,
    required this.onPressed,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    return DertamButton(
      text: text,
      onPressed: onPressed,
      isOutlined: true,
      width: width,
      height: height,
    );
  }
}

///
/// A gradient button variant.
///
class DertamButtonGradient extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final double? width;
  final double? height;
  final LinearGradient? gradient;
  final bool isLoading;

  const DertamButtonGradient({
    super.key,
    required this.text,
    required this.onPressed,
    this.width,
    this.height,
    this.gradient,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return DertamButton(
      text: text,
      onPressed: onPressed,
      isGradient: true,
      width: width,
      height: height,
      gradient: gradient,
      isLoading: isLoading,
    );
  }
}
