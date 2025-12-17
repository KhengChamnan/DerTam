import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_detail_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_add_place_to_trip.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_place_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:provider/provider.dart';

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
  final Map<DateTime, List<Map<String, dynamic>>> _organizedPlaces = {};

  @override
  void initState() {
    super.initState();
    // Ensure TripProvider is initialized with the current trip's places for editing
    final tripProvider = context.read<TripProvider>();
    tripProvider.setAddedPlaces(
      List<Map<String, dynamic>>.from(widget.addedPlaces),
    );
    _organizeByDays();
  }

  // ==================== Data Organization ====================

  void _organizeByDays() {
    _organizedPlaces.clear();

    for (var item in widget.addedPlaces) {
      final selectedDate = item['selectedDate'] as DateTime;
      final dateKey = _normalizeDate(selectedDate);

      _organizedPlaces.putIfAbsent(dateKey, () => []).add(item);
    }
    _sortPlacesByAddedTime();
  }

  void _sortPlacesByAddedTime() {
    _organizedPlaces.forEach((date, places) {
      places.sort((a, b) {
        final dateA = a['addedAt'] as DateTime;
        final dateB = b['addedAt'] as DateTime;
        return dateA.compareTo(dateB);
      });
    });
  }

  DateTime _normalizeDate(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  List<DateTime> _getTripDays() {
    final days = <DateTime>[];
    DateTime currentDate = widget.startDate;

    while (currentDate.isBefore(widget.endDate) ||
        currentDate.isAtSameMomentAs(widget.endDate)) {
      days.add(currentDate);
      currentDate = currentDate.add(const Duration(days: 1));
    }

    return days;
  }

  // ==================== Formatting ====================

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

    final weekday = weekdays[date.weekday - 1];
    final month = months[date.month - 1];
    return '$weekday, $month ${date.day}';
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

    final startMonth = months[widget.startDate.month - 1];
    final endMonth = months[widget.endDate.month - 1];

    return '${widget.startDate.day} $startMonth ${widget.startDate.year} - '
        '${widget.endDate.day} $endMonth ${widget.endDate.year}';
  }

  // ==================== Data Transformation ====================

  Map<String, List<int>> _buildDayPlaceIdsMap() {
    final dayPlaceIds = <String, List<int>>{};
    final tripDays = _getTripDays();
    for (int i = 0; i < tripDays.length; i++) {
      final day = tripDays[i];
      final dayKey = _normalizeDate(day);
      final placesForDay = _organizedPlaces[dayKey] ?? [];

      final placeIds = placesForDay
          .map((item) {
            final place = item['place'] as Place;
            return int.tryParse(place.placeId);
          })
          .where((id) => id != null)
          .cast<int>()
          .toList();
      dayPlaceIds['day${i + 1}'] = placeIds;
    }
    return dayPlaceIds;
  }

  // ==================== Actions ====================

  Future<void> _confirmPlan() async {
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
    final dayPlaceIds = _buildDayPlaceIdsMap();
    _showLoadingDialog();

    try {
      await tripProvider.confirmTripPlan(widget.tripId, dayPlaceIds);

      if (!mounted) return;
      _hideLoadingDialog();
      _navigateToTripDetail();
    } catch (e) {
      if (!mounted) return;
      _hideLoadingDialog();
      _showErrorMessage(e.toString());
    }
  }

  void _deletePlace(Map<String, dynamic> placeItem) {
    setState(() {
      widget.addedPlaces.remove(placeItem);
      _organizeByDays();
    });
  }

  // ==================== Navigation ====================
  void _navigateToEditPlaces() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DertamAddPlaceToTrip(tripId: widget.tripId),
      ),
    ).then(_handleEditPlacesResult);
  }

  void _handleEditPlacesResult(dynamic result) {
    if (result != null && result is List<Map<String, dynamic>>) {
      setState(() {
        widget.addedPlaces.clear();
        widget.addedPlaces.addAll(result);
        _organizeByDays();
      });
    }
  }

  void _navigateToTripDetail() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => TripDetailScreen(tripId: widget.tripId),
      ),
    );
  }

  // ==================== UI Helpers ====================

  void _showLoadingDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: CircularProgressIndicator(color: DertamColors.primaryDark),
      ),
    );
  }

  void _hideLoadingDialog() {
    Navigator.pop(context);
  }

  void _showErrorMessage(String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Failed to confirm trip: $error'),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // ==================== Build Methods ====================

  @override
  Widget build(BuildContext context) {
    final tripDays = _getTripDays();

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        title: Text(
          'Review Your Trip',
          style: DertamTextStyles.title.copyWith(
            color: DertamColors.primaryBlue,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: GestureDetector(
              onTap: () => _navigateToEditPlaces(),
              child: Container(
                padding: const EdgeInsets.all(8),
                child: Icon(
                  Icons.edit,
                  color: DertamColors.primaryDark,
                  size: 24,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
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
                    const SizedBox(height: 3),
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
          const Divider(height: 1, color: Colors.grey),
          SizedBox(height: DertamSpacings.s),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: DertamSpacings.l),
              itemCount: tripDays.length,
              itemBuilder: (context, index) {
                final day = tripDays[index];
                return _buildDaySection(day, index + 1);
              },
            ),
          ),
          Container(
            padding: EdgeInsets.all(DertamSpacings.l),
            decoration: BoxDecoration(
              color: DertamColors.white,
              boxShadow: [
                BoxShadow(
                  color: DertamColors.primaryBlue.withOpacity(0.1),
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDaySection(DateTime day, int dayNumber) {
    final dayKey = _normalizeDate(day);
    final placesForDay = _organizedPlaces[dayKey] ?? [];

    return Container(
      margin: EdgeInsets.only(bottom: DertamSpacings.l),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDayHeader(day, dayNumber),
          SizedBox(height: DertamSpacings.m),
          _buildPlacesList(placesForDay),
        ],
      ),
    );
  }

  Widget _buildDayHeader(DateTime day, int dayNumber) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Day $dayNumber: ${_formatDate(day)}',
          style: DertamTextStyles.subtitle.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ],
    );
  }

  Widget _buildPlacesList(List<Map<String, dynamic>> placesForDay) {
    if (placesForDay.isEmpty) {
      return Container(
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
      );
    }

    return Column(
      children: placesForDay.map((item) {
        final place = item['place'] as Place;
        return TripPlaceCard(
          place: place,
          enableSwipeToDelete: true,
          onDelete: () => _deletePlace(item),
          onTap: () => _handlePlaceTap(place),
        );
      }).toList(),
    );
  }

  void _handlePlaceTap(Place place) {
    debugPrint('Tapped on ${place.name}');
  }
}
