import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class CalendarWidget extends StatelessWidget {
  final DateTime currentMonth;
  final DateTime? startDate;
  final DateTime? endDate;
  final Function(DateTime) onDateSelected;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  const CalendarWidget({
    super.key,
    required this.currentMonth,
    this.startDate,
    this.endDate,
    required this.onDateSelected,
    required this.onPreviousMonth,
    required this.onNextMonth,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Calendar Header
          CalendarHeader(
            currentMonth: currentMonth,
            onPreviousMonth: onPreviousMonth,
            onNextMonth: onNextMonth,
          ),
          
          // Calendar Grid
          CalendarGrid(
            currentMonth: currentMonth,
            startDate: startDate,
            endDate: endDate,
            onDateSelected: onDateSelected,
          ),
        ],
      ),
    );
  }
}

class CalendarHeader extends StatelessWidget {
  final DateTime currentMonth;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  const CalendarHeader({
    super.key,
    required this.currentMonth,
    required this.onPreviousMonth,
    required this.onNextMonth,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(DertamSpacings.m),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: onPreviousMonth,
            icon: Icon(Icons.chevron_left),
          ),
          Text(
            _getMonthYearString(currentMonth),
            style: DertamTextStyles.subtitle.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          IconButton(
            onPressed: onNextMonth,
            icon: Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  String _getMonthYearString(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}

class CalendarGrid extends StatelessWidget {
  final DateTime currentMonth;
  final DateTime? startDate;
  final DateTime? endDate;
  final Function(DateTime) onDateSelected;

  const CalendarGrid({
    super.key,
    required this.currentMonth,
    this.startDate,
    this.endDate,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    final daysInMonth = DateTime(currentMonth.year, currentMonth.month + 1, 0).day;
    final firstDayOfMonth = DateTime(currentMonth.year, currentMonth.month, 1);
    final startingWeekday = firstDayOfMonth.weekday % 7;

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: DertamSpacings.m,
        vertical: DertamSpacings.s,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Weekday headers
          const WeekdayHeaders(),
          SizedBox(height: 8),
          
          // Calendar days
          ...List.generate(6, (weekIndex) {
            final weekWidgets = List.generate(7, (dayIndex) {
              final dayNumber = weekIndex * 7 + dayIndex - startingWeekday + 1;
              
              if (dayNumber < 1 || dayNumber > daysInMonth) {
                return SizedBox(width: 35, height: 35);
              }
              
              final date = DateTime(currentMonth.year, currentMonth.month, dayNumber);
              
              return CalendarDay(
                date: date,
                startDate: startDate,
                endDate: endDate,
                onTap: () => onDateSelected(date),
              );
            });
            
            // Only show rows that have at least one valid day
            if (weekWidgets.any((widget) => widget is CalendarDay)) {
              return Padding(
                padding: EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: weekWidgets,
                ),
              );
            } else {
              return SizedBox.shrink();
            }
          }).where((widget) => widget is! SizedBox || (widget).height != null),
          
          SizedBox(height: DertamSpacings.s),
        ],
      ),
    );
  }
}

class WeekdayHeaders extends StatelessWidget {
  const WeekdayHeaders({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          .map((day) => SizedBox(
                width: 35,
                child: Center(
                  child: Text(
                    day,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ),
              ))
          .toList(),
    );
  }
}

class CalendarDay extends StatelessWidget {
  final DateTime date;
  final DateTime? startDate;
  final DateTime? endDate;
  final VoidCallback onTap;

  const CalendarDay({
    super.key,
    required this.date,
    this.startDate,
    this.endDate,
    required this.onTap,
  });

  bool get isSelected => _isDateSelected(date);
  bool get isInRange => _isDateInRange(date);
  bool get isToday => _isToday(date);
  bool get isPastDate => date.isBefore(DateTime.now().subtract(Duration(days: 1)));

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isPastDate ? null : onTap,
      child: Container(
        width: 35,
        height: 35,
        margin: EdgeInsets.all(1),
        decoration: BoxDecoration(
          color: isPastDate
              ? Colors.grey[200]
              : isSelected
                  ? DertamColors.primaryDark
                  : isInRange
                      ? DertamColors.primaryDark.withOpacity(0.3)
                      : isToday
                          ? Colors.blue[100]
                          : Colors.transparent,
          borderRadius: BorderRadius.circular(17.5),
        ),
        child: Center(
          child: Text(
            date.day.toString(),
            style: TextStyle(
              color: isPastDate
                  ? Colors.grey[400]
                  : isSelected
                      ? DertamColors.white
                      : isInRange
                          ? DertamColors.primaryDark
                          : DertamColors.black,
              fontWeight: isSelected || isToday 
                  ? FontWeight.w600 
                  : FontWeight.normal,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }

  bool _isDateSelected(DateTime date) {
    return (startDate != null && _isSameDay(date, startDate!)) ||
           (endDate != null && _isSameDay(date, endDate!));
  }

  bool _isDateInRange(DateTime date) {
    if (startDate == null || endDate == null) return false;
    return date.isAfter(startDate!) && date.isBefore(endDate!);
  }

  bool _isToday(DateTime date) {
    final today = DateTime.now();
    return _isSameDay(date, today);
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
           date1.month == date2.month &&
           date1.day == date2.day;
  }
}