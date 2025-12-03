import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/models/trips/trips.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

/// A modal bottom sheet that displays the days of a selected trip for selection
class TripDaySelectionModal extends StatefulWidget {
  final Trip trip;
  final Place place;
  final Function(DateTime selectedDate) onDaySelected;
  final VoidCallback onCancel;

  const TripDaySelectionModal({
    super.key,
    required this.trip,
    required this.place,
    required this.onDaySelected,
    required this.onCancel,
  });

  /// Shows the trip day selection modal
  static Future<void> show({
    required BuildContext context,
    required Trip trip,
    required Place place,
    required Function(DateTime selectedDate) onDaySelected,
    required VoidCallback onCancel,
  }) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: true,
      enableDrag: true,
      builder: (context) => TripDaySelectionModal(
        trip: trip,
        place: place,
        onDaySelected: onDaySelected,
        onCancel: onCancel,
      ),
    );
  }

  @override
  State<TripDaySelectionModal> createState() => _TripDaySelectionModalState();
}

class _TripDaySelectionModalState extends State<TripDaySelectionModal> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Fetch trip details to get the days
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchTripDetails();
    });
  }

  Future<void> _fetchTripDetails() async {
    setState(() => _isLoading = true);
    try {
      await context.read<TripProvider>().fetchTripDetail(
        widget.trip.tripId.toString(),
      );
    } catch (e) {
      // Error will be handled by the widget state
    }
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  List<DateTime> _getTripDays() {
    final days = <DateTime>[];
    DateTime currentDate = widget.trip.startDate;

    while (currentDate.isBefore(widget.trip.endDate) ||
        currentDate.isAtSameMomentAs(widget.trip.endDate)) {
      days.add(currentDate);
      currentDate = currentDate.add(const Duration(days: 1));
    }

    return days;
  }

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final tripDetailState = tripProvider.getTripDetail;
    final tripDays = _getTripDays();

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: EdgeInsets.symmetric(vertical: DertamSpacings.s),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: DertamColors.neutralLighter,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: DertamSpacings.l,
              vertical: DertamSpacings.s,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: widget.onCancel,
                  icon: Icon(
                    Icons.arrow_back_ios,
                    color: DertamColors.primaryDark,
                    size: 20,
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        'Select a Day',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: DertamColors.black,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 4),
                      Text(
                        widget.trip.tripName,
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.close,
                      color: DertamColors.primaryDark,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Place info card
          Container(
            margin: EdgeInsets.symmetric(horizontal: DertamSpacings.m),
            padding: EdgeInsets.all(DertamSpacings.s),
            decoration: BoxDecoration(
              color: DertamColors.primaryBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                // Place image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: widget.place.imagesUrl.isNotEmpty
                      ? Image.network(
                          widget.place.imagesUrl,
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              _buildPlaceholder(),
                        )
                      : _buildPlaceholder(),
                ),
                SizedBox(width: DertamSpacings.s),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.place.name,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: DertamColors.black,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 2),
                      Text(
                        widget.place.locationName.isNotEmpty
                            ? widget.place.locationName
                            : 'Location',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.add_location_alt,
                  color: DertamColors.primaryBlue,
                  size: 24,
                ),
              ],
            ),
          ),

          Divider(height: 20, color: Colors.grey[300]),

          // Day list
          Flexible(
            child: _isLoading
                ? Center(
                    child: Padding(
                      padding: EdgeInsets.all(DertamSpacings.xl),
                      child: CircularProgressIndicator(
                        color: DertamColors.primaryBlue,
                      ),
                    ),
                  )
                : _buildDayList(tripDays, tripDetailState),
          ),

          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: DertamColors.primaryBlue.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(Icons.place, color: DertamColors.primaryBlue, size: 24),
    );
  }

  Widget _buildDayList(
    List<DateTime> tripDays,
    AsyncValue<dynamic> tripDetailState,
  ) {
    // Get existing places from trip detail if available
    final tripDetail = tripDetailState.data?.data;
    final existingDays = tripDetail?.days as Map<String, dynamic>?;

    return ListView.separated(
      shrinkWrap: true,
      padding: EdgeInsets.symmetric(
        horizontal: DertamSpacings.m,
        vertical: DertamSpacings.s,
      ),
      itemCount: tripDays.length,
      separatorBuilder: (context, index) => SizedBox(height: DertamSpacings.s),
      itemBuilder: (context, index) {
        final day = tripDays[index];
        final dayNumber = index + 1;

        // Check if this day already has places
        int placesCount = 0;
        if (existingDays != null) {
          final dayKey = 'day_$dayNumber';
          final dayData = existingDays[dayKey];
          if (dayData != null) {
            placesCount = dayData.placeCounts ?? 0;
          }
        }

        return _DayCard(
          dayNumber: dayNumber,
          date: day,
          placesCount: placesCount,
          onTap: () {
            Navigator.pop(context);
            widget.onDaySelected(day);
          },
        );
      },
    );
  }
}

class _DayCard extends StatelessWidget {
  final int dayNumber;
  final DateTime date;
  final int placesCount;
  final VoidCallback onTap;

  const _DayCard({
    required this.dayNumber,
    required this.date,
    required this.placesCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('EEE, MMM d, yyyy');
    final dateStr = dateFormat.format(date);
    final isToday = _isToday(date);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.all(DertamSpacings.m),
        decoration: BoxDecoration(
          color: isToday
              ? DertamColors.primaryBlue.withOpacity(0.1)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isToday ? DertamColors.primaryBlue : Colors.grey[200]!,
            width: isToday ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Day number badge
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: DertamColors.primaryBlue,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Day',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  Text(
                    '$dayNumber',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: DertamSpacings.m),

            // Day info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        dateStr,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: DertamColors.black,
                        ),
                      ),
                      if (isToday) ...[
                        SizedBox(width: 8),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: DertamColors.primaryBlue,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Today',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  SizedBox(height: 4),
                  Text(
                    placesCount > 0
                        ? '$placesCount ${placesCount == 1 ? 'place' : 'places'} planned'
                        : 'No places yet',
                    style: TextStyle(
                      fontSize: 12,
                      color: placesCount > 0
                          ? DertamColors.primaryBlue
                          : Colors.grey[500],
                    ),
                  ),
                ],
              ),
            ),

            // Add icon
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: DertamColors.primaryBlue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.add, color: DertamColors.primaryBlue, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }
}
