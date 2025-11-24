import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class BudgetCard extends StatelessWidget {
  final String title;
  final double amount;
  final String subtitle;
  final double progress;
  final Color backgroundColor;
  final Color textColor;
  final Color progressColor;
  final String currencySymbol;
  final VoidCallback? onTap;

  const BudgetCard({
    super.key,
    required this.title,
    required this.amount,
    required this.subtitle,
    required this.progress,
    required this.backgroundColor,
    required this.textColor,
    required this.progressColor,
    required this.currencySymbol,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: DertamColors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: textColor.withOpacity(0.8),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down,
                  color: textColor.withOpacity(0.8),
                  size: 20,
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Amount
            Text(
              '$currencySymbol ${amount.toStringAsFixed(0)}',
              style: TextStyle(
                color: textColor,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 4),

            // Subtitle
            Text(
              subtitle,
              style: TextStyle(color: textColor.withOpacity(0.7), fontSize: 12),
            ),

            const SizedBox(height: 12),

            // Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                backgroundColor: textColor.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                minHeight: 6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
