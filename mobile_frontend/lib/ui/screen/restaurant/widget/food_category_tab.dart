import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

///
/// Food Category Tab widget for restaurant menu categories.
/// Displays a selectable category chip with icon and label.
/// Used in the restaurant detail screen for filtering menu items.
///
class FoodCategoryTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const FoodCategoryTab({
    super.key,
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: DertamSpacings.m,
          vertical: DertamSpacings.xs,
        ),
        decoration: BoxDecoration(
          color: isSelected ? DertamColors.primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(DertamSpacings.radiusSmall),
          border: Border.all(
            color: isSelected ? DertamColors.primaryDark : Colors.grey.shade300,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : DertamColors.primaryDark,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: DertamTextStyles.bodyMedium.copyWith(
                color: isSelected ? Colors.white : DertamColors.primaryDark,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
