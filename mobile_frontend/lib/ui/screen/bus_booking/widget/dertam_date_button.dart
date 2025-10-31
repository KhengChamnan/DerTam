import 'package:flutter/material.dart';

class DertamDateButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const DertamDateButton({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? Colors.white : Colors.white.withOpacity(0.5),
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontFamily: 'Ubuntu',
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
