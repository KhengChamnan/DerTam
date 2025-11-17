import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class PaymentOptionItem extends StatelessWidget {
  final String value;
  final String label;
  final String imagePath;
  final bool isSelected;
  final bool hasCheckMark;
  final VoidCallback onTap;

  const PaymentOptionItem({
    super.key,
    required this.value,
    required this.label,
    required this.imagePath,
    required this.isSelected,
    required this.onTap,
    this.hasCheckMark = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          // Payment method image/icon
          Container(
            width: 40,
            height: 40,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Image.asset(
              imagePath,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Icon(
                  Icons.payment,
                  color: DertamColors.primaryBlue,
                  size: 24,
                );
              },
            ),
          ),
          const SizedBox(width: DertamSpacings.m),

          // Label
          Expanded(
            child: Text(
              label,
              style: DertamTextStyles.bodyMedium.copyWith(
                color: DertamColors.black,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

          // Radio Button or Check Mark
          if (hasCheckMark && isSelected)
            Icon(Icons.check_circle, color: DertamColors.primaryBlue, size: 18)
          else
            Container(
              width: 15,
              height: 15,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? DertamColors.primaryBlue
                      : Colors.grey.shade400,
                  width: 2,
                ),
                color: isSelected
                    ? DertamColors.primaryBlue
                    : Colors.transparent,
              ),
            ),
        ],
      ),
    );
  }
}
