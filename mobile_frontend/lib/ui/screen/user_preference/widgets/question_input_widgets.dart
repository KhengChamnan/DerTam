import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/question/user_preferrence.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class QuestionInputWidgets {
  static Widget buildTextInput({
    required TripPlanningQuestion question,
    required Function(String) onChanged,
  }) {
    return TextField(
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: question.placeholder,
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: DertamColors.primaryBlue, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 16,
        ),
      ),
      style: const TextStyle(fontSize: 16),
    );
  }

  static Widget buildSingleChoice({
    required TripPlanningQuestion question,
    required dynamic selectedValue,
    required Function(String) onSelect,
  }) {
    return Column(
      children: question.options!.map((option) {
        final isSelected = selectedValue == option;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () => onSelect(option),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected
                    ? DertamColors.primaryBlue.withOpacity(0.1)
                    : Colors.grey.shade50,
                border: Border.all(
                  color: isSelected
                      ? DertamColors.primaryBlue
                      : Colors.grey.shade200,
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
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
                    child: isSelected
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    option,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.normal,
                      color: isSelected
                          ? DertamColors.primaryBlue
                          : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  static Widget buildMultipleChoice({
    required TripPlanningQuestion question,
    required List<String> selectedValues,
    required Function(String) onToggle,
  }) {
    return Column(
      children: question.options!.map((option) {
        final isSelected = selectedValues.contains(option);
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () => onToggle(option),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected
                    ? DertamColors.primaryBlue.withOpacity(0.1)
                    : Colors.grey.shade50,
                border: Border.all(
                  color: isSelected
                      ? DertamColors.primaryBlue
                      : Colors.grey.shade200,
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
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
                    child: isSelected
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    option,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.normal,
                      color: isSelected
                          ? DertamColors.primaryBlue
                          : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
