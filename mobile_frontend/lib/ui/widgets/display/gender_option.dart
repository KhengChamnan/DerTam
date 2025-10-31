import 'package:flutter/material.dart';
import '../../theme/dertam_apptheme.dart';

class GenderOption extends StatefulWidget {
  final String value;
  final String label;
  final String selectedGender;
  final ValueChanged<String> onGenderChanged;

  const GenderOption({
    super.key,
    required this.value,
    required this.label,
    required this.selectedGender,
    required this.onGenderChanged,
  });

  @override
  State<GenderOption> createState() => _GenderOptionState();
}

class _GenderOptionState extends State<GenderOption> {
  @override
  Widget build(BuildContext context) {
    final bool isSelected = widget.selectedGender == widget.value;

    return GestureDetector(
      onTap: () {
        widget.onGenderChanged(widget.value);
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected
                    ? DertamColors.primaryBlue
                    : Colors.grey.shade400,
                width: 2,
              ),
              color: isSelected ? DertamColors.primaryBlue : Colors.transparent,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            widget.label,
            style: DertamTextStyles.bodyMedium.copyWith(
              fontSize: 14,
              color: DertamColors.black,
            ),
          ),
        ],
      ),
    );
  }
}
