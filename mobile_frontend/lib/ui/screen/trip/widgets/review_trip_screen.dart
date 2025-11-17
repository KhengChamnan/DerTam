import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_detail.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/select_place.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/trip_place_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/models/place/place.dart';

class ReviewTripScreen extends StatefulWidget {
  final String tripId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;
  final List<Map<String, dynamic>> addedPlaces;

  const ReviewTripScreen({
    super.key,
    required this.tripId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
    required this.addedPlaces,
  });

  @override
  State<ReviewTripScreen> createState() => _ReviewTripScreenState();
}

class _ReviewTripScreenState extends State<ReviewTripScreen> {
  Map<DateTime, List<Map<String, dynamic>>> _organizedPlaces = {};

  @override
  void initState() {
    super.initState();
    _organizeByDays();
  }

  void _organizeByDays() {
    _organizedPlaces.clear();

    // Group places by selected date
    for (var item in widget.addedPlaces) {
      final selectedDate = item['selectedDate'] as DateTime;
      final dateKey = DateTime(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
      );

      if (_organizedPlaces[dateKey] == null) {
        _organizedPlaces[dateKey] = [];
      }
      _organizedPlaces[dateKey]!.add(item);
    }

    // Sort places within each day by added time
    _organizedPlaces.forEach((date, places) {
      places.sort(
        (a, b) =>
            (a['addedAt'] as DateTime).compareTo(b['addedAt'] as DateTime),
      );
    });
  }

  List<DateTime> _getTripDays() {
    List<DateTime> days = [];
    DateTime currentDate = widget.startDate;

    while (currentDate.isBefore(widget.endDate) ||
        currentDate.isAtSameMomentAs(widget.endDate)) {
      days.add(currentDate);
      currentDate = currentDate.add(Duration(days: 1));
    }

    return days;
  }

  String _formatDate(DateTime date) {
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
    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}';
  }

  String _formatDateRange() {
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

    return '${widget.startDate.day} ${months[widget.startDate.month - 1]} ${widget.startDate.year} - ${widget.endDate.day} ${months[widget.endDate.month - 1]} ${widget.endDate.year}';
  }

  void _confirmPlan() {
    // Navigate to Trip Detail Screen instead of showing dialog
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => TripDetailScreen(
          tripId: widget.tripId,
          tripName: widget.tripName,
          startDate: widget.startDate,
          endDate: widget.endDate,
          addedPlaces: widget.addedPlaces,
        ),
      ),
    );
  }

  void _editDay(DateTime day) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SelectPlaceScreen(
          tripId: widget.tripId,
          tripName: widget.tripName,
          startDate: widget.startDate,
          endDate: widget.endDate,
          existingPlaces: widget.addedPlaces,
          preSelectedDate: day, // Add this parameter to pre-select the date
        ),
      ),
    ).then((result) {
      // Handle result when returning from SelectPlaceScreen
      if (result != null && result is List<Map<String, dynamic>>) {
        setState(() {
          widget.addedPlaces.clear();
          widget.addedPlaces.addAll(result);
          _organizeByDays();
        });
      }
    });
  }

  void _deletePlace(Map<String, dynamic> placeItem) {
    setState(() {
      widget.addedPlaces.remove(placeItem);
      _organizeByDays();
    });
  }

  void _continueEditing() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SelectPlaceScreen(
          tripId: widget.tripId,
          tripName: widget.tripName,
          startDate: widget.startDate,
          endDate: widget.endDate,
          existingPlaces: widget.addedPlaces,
          // Don't pass preSelectedDate - this allows normal flow
        ),
      ),
    ).then((result) {
      // Handle result when returning from SelectPlaceScreen
      if (result != null && result is List<Map<String, dynamic>>) {
        setState(() {
          widget.addedPlaces.clear();
          widget.addedPlaces.addAll(result);
          _organizeByDays();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final tripDays = _getTripDays();

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: DertamColors.primaryBlue),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Review Your Trip',
          style: DertamTextStyles.subtitle.copyWith(color: DertamColors.primaryBlue),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Trip Header Info
          Container(
            padding: EdgeInsets.all(DertamSpacings.m),
            margin: EdgeInsets.symmetric(horizontal: DertamSpacings.s),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Trip : ${widget.tripName}',
                      style: DertamTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      _formatDateRange(),
                      style: DertamTextStyles.bodySmall.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey[300]),
          SizedBox(height: DertamSpacings.s),

          // Trip Days List
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: DertamSpacings.l),
              itemCount: tripDays.length,
              itemBuilder: (context, index) {
                final day = tripDays[index];
                final dayKey = DateTime(day.year, day.month, day.day);
                final placesForDay = _organizedPlaces[dayKey] ?? [];
                final dayNumber = index + 1;

                return Container(
                  margin: EdgeInsets.only(bottom: DertamSpacings.l),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Day Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Day $dayNumber: ${_formatDate(day)}',
                            style: DertamTextStyles.subtitle.copyWith(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _editDay(day),
                            child: Container(
                              padding: EdgeInsets.all(8),
                              child: Icon(
                                Icons.edit,
                                color: DertamColors.primaryDark,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: DertamSpacings.m),

                      // Places for this day
                      if (placesForDay.isEmpty)
                        Container(
                          padding: EdgeInsets.all(DertamSpacings.s),
                          child: Center(
                            child: Text(
                              'No activities planned for this day',
                              style: DertamTextStyles.body.copyWith(
                                color: Colors.grey[600],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        )
                      else
                        ...placesForDay.map((item) {
                          final place = item['place'] as Place;
                          return TripPlaceCard(
                            place: place,
                            enableSwipeToDelete:
                                true, // Enable swipe-to-delete in review screen
                            onDelete: () =>
                                _deletePlace(item), // Add the onDelete callback
                            onTap: () {
                              // Optional: Add tap functionality for review screen
                              print('Tapped on ${place.name}');
                            },
                          );
                        }).toList(),
                    ],
                  ),
                );
              },
            ),
          ),

          // Bottom Action Buttons
          Container(
            padding: EdgeInsets.all(DertamSpacings.l),
            decoration: BoxDecoration(
              color: DertamColors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DertamButton(
                    text: 'Confirm plan',
                    onPressed: _confirmPlan,
                    backgroundColor: DertamColors.primaryDark,
                    width: double.infinity,
                  ),
                  SizedBox(height: DertamSpacings.m),
                  GestureDetector(
                    onTap: _continueEditing,
                    child: Text(
                      'Continue Editing',
                      style: DertamTextStyles.body.copyWith(
                        color: DertamColors.primaryDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
