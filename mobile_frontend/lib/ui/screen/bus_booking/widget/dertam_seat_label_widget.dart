import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamSeatLabelWidget extends StatelessWidget {
  final String label;
  const DertamSeatLabelWidget({super.key, required this.label});
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 31,
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: DertamTextStyles.bodyMedium.copyWith(
          color: const Color(0xFFA0A0A0),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
