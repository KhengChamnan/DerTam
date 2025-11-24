import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/calender.dart';

class DertamSelectDate {
  static Future<Map<String, dynamic>?> show(BuildContext context) {
    return showDialog<Map<String, dynamic>>(
      context: context,
      builder: (BuildContext context) {
        DateTime? checkInDate;
        DateTime? checkOutDate;
        DateTime currentMonth = DateTime.now();
        int guestCount = 2;

        return StatefulBuilder(
          builder: (context, setState) {
            final int numberOfNights =
                (checkInDate != null && checkOutDate != null)
                ? checkOutDate!.difference(checkInDate!).inDays
                : 0;

            void selectDate(DateTime date) {
              setState(() {
                if (checkInDate == null) {
                  checkInDate = date;
                } else if (checkOutDate == null) {
                  if (date.isAfter(checkInDate!)) {
                    checkOutDate = date;
                  } else {
                    checkInDate = date;
                    checkOutDate = null;
                  }
                } else {
                  checkInDate = date;
                  checkOutDate = null;
                }
              });
            }

            void previousMonth() {
              setState(() {
                currentMonth = DateTime(
                  currentMonth.year,
                  currentMonth.month - 1,
                );
              });
            }

            void nextMonth() {
              setState(() {
                currentMonth = DateTime(
                  currentMonth.year,
                  currentMonth.month + 1,
                );
              });
            }

            String formatDate(DateTime date) {
              const months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ];
              return '${months[date.month - 1]} ${date.day}, ${date.year}';
            }

            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              insetPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 24,
              ),
              clipBehavior: Clip.antiAlias,
              child: Container(
                width: MediaQuery.of(context).size.width,
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.85,
                  maxWidth: 500,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Scrollable content
                    Flexible(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Calendar Widget
                            CalendarWidget(
                              currentMonth: currentMonth,
                              startDate: checkInDate,
                              endDate: checkOutDate,
                              onDateSelected: selectDate,
                              onPreviousMonth: previousMonth,
                              onNextMonth: nextMonth,
                            ),
                            const SizedBox(height: 16),

                            // Date display with improved layout
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  // Check-in date
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Check-in',
                                          style: DertamTextStyles.bodySmall
                                              .copyWith(
                                                color: Colors.grey[600],
                                                fontSize: 11,
                                              ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          checkInDate != null
                                              ? formatDate(checkInDate!)
                                              : 'Select date',
                                          style: DertamTextStyles.bodyMedium
                                              .copyWith(
                                                fontWeight: FontWeight.w600,
                                                fontSize: 13,
                                                color: checkInDate != null
                                                    ? DertamColors.black
                                                    : Colors.grey,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Divider
                                  Container(
                                    height: 40,
                                    width: 1,
                                    color: Colors.grey[300],
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                    ),
                                  ),

                                  // Check-out date
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Check-out',
                                          style: DertamTextStyles.bodySmall
                                              .copyWith(
                                                color: Colors.grey[600],
                                                fontSize: 11,
                                              ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          checkOutDate != null
                                              ? formatDate(checkOutDate!)
                                              : 'Select date',
                                          style: DertamTextStyles.bodyMedium
                                              .copyWith(
                                                fontWeight: FontWeight.w600,
                                                fontSize: 13,
                                                color: checkOutDate != null
                                                    ? DertamColors.black
                                                    : Colors.grey,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Number of nights indicator
                            if (numberOfNights > 0) ...[
                              const SizedBox(height: 8),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: DertamColors.primaryDark.withOpacity(
                                      0.1,
                                    ),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    '$numberOfNights night${numberOfNights > 1 ? 's' : ''}',
                                    style: DertamTextStyles.bodySmall.copyWith(
                                      color: DertamColors.primaryDark,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 20),

                            // Select Guest Section
                            Text(
                              'Select Guest',
                              style: DertamTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: DertamColors.primaryDark,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Guest Counter with improved design
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Number of guests',
                                    style: DertamTextStyles.bodyMedium.copyWith(
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      Container(
                                        decoration: BoxDecoration(
                                          color: guestCount > 1
                                              ? DertamColors.primaryDark
                                              : Colors.grey[300],
                                          shape: BoxShape.circle,
                                        ),
                                        child: IconButton(
                                          onPressed: () {
                                            if (guestCount > 1) {
                                              setState(() {
                                                guestCount--;
                                              });
                                            }
                                          },
                                          icon: const Icon(Icons.remove),
                                          iconSize: 18,
                                          color: Colors.white,
                                          padding: const EdgeInsets.all(4),
                                          constraints: const BoxConstraints(
                                            minWidth: 32,
                                            minHeight: 32,
                                          ),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 20,
                                        ),
                                        child: Text(
                                          '$guestCount',
                                          style: DertamTextStyles.title
                                              .copyWith(
                                                fontSize: 20,
                                                fontWeight: FontWeight.bold,
                                                color: DertamColors.primaryDark,
                                              ),
                                        ),
                                      ),
                                      Container(
                                        decoration: BoxDecoration(
                                          color: DertamColors.primaryDark,
                                          shape: BoxShape.circle,
                                        ),
                                        child: IconButton(
                                          onPressed: () {
                                            setState(() {
                                              guestCount++;
                                            });
                                          },
                                          icon: const Icon(Icons.add),
                                          iconSize: 18,
                                          color: Colors.white,
                                          padding: const EdgeInsets.all(4),
                                          constraints: const BoxConstraints(
                                            minWidth: 32,
                                            minHeight: 32,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Search Button - Fixed at bottom
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          top: BorderSide(color: Colors.grey[300]!),
                        ),
                      ),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                (checkInDate != null && checkOutDate != null)
                                ? DertamColors.primaryDark
                                : Colors.grey[400],
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            elevation: 0,
                          ),
                          onPressed:
                              (checkInDate != null && checkOutDate != null)
                              ? () {
                                  // Return the selected values
                                  Navigator.pop(context, {
                                    'checkInDate': checkInDate,
                                    'checkOutDate': checkOutDate,
                                    'guestCount': guestCount,
                                    'numberOfNights': numberOfNights,
                                  });
                                }
                              : null,
                          child: Text(
                            'Search room',
                            style: DertamTextStyles.button.copyWith(
                              color: DertamColors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
