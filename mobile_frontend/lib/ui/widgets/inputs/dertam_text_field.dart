import 'package:flutter/material.dart';
import '../../theme/dertam_apptheme.dart';

///
/// A reusable text field widget for DerTam app.
/// Provides consistent styling and behavior for text inputs.
/// Supports password fields with visibility toggle.
///
class DertamTextField extends StatefulWidget {
  final String hintText;
  final TextEditingController? controller;
  final bool isPassword;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final Widget? prefixIcon;
  final bool enabled;

  const DertamTextField({
    super.key,
    required this.hintText,
    this.controller,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onChanged,
    this.prefixIcon,
    this.enabled = true,
  });

  @override
  State<DertamTextField> createState() => _DertamTextFieldState();
}

class _DertamTextFieldState extends State<DertamTextField> {
  bool _obscureText = true; // Password visibility state

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 53,
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(DertamSpacings.radiusLarge),
        border: Border.all(color: const Color(0xFFD9D9D9), width: 1),
      ),
      child: TextFormField(
        controller: widget.controller,
        obscureText: widget.isPassword ? _obscureText : false,
        keyboardType: widget.keyboardType,
        validator: widget.validator,
        onChanged: widget.onChanged,
        enabled: widget.enabled,
        style: DertamTextStyles.body.copyWith(color: DertamColors.textPrimary),
        decoration: InputDecoration(
          hintText: widget.hintText,
          hintStyle: DertamTextStyles.bodyMedium.copyWith(
            color: Colors.black.withOpacity(0.61),
          ),
          prefixIcon: widget.prefixIcon,
          suffixIcon: widget.isPassword
              ? IconButton(
                  icon: Icon(
                    _obscureText ? Icons.visibility : Icons.visibility_off,
                    color: DertamColors.primaryDark,
                    size: DertamSize.icon,
                  ),
                  onPressed: () {
                    // Toggle password visibility
                    setState(() {
                      _obscureText = !_obscureText;
                    });
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(
            horizontal: DertamSpacings.l,
            vertical: DertamSpacings.m,
          ),
        ),
      ),
    );
  }
}
