import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_add_place_to_trip.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/calender.dart';
import 'package:mobile_frontend/utils/animations_utils.dart';
import 'package:provider/provider.dart';

class TripDateScreen extends StatefulWidget {
  final String tripName;
  const TripDateScreen({super.key, required this.tripName});
  @override
  State<TripDateScreen> createState() => _TripDateScreenState();
}

class _TripDateScreenState extends State<TripDateScreen> {
  DateTime? _startDate;
  DateTime? _endDate;
  DateTime _currentMonth = DateTime.now();
  bool _isLoading = false;
  Future<void> _createTrip() async {
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
    tripProvider.clearAddedPlaces();

    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please select both start and end dates'),
          backgroundColor: DertamColors.red,
        ),
      );
      return;
    }
    setState(() {
      _isLoading = true;
    });
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      await tripProvider.createTripPlan(
        widget.tripName,
        _startDate!,
        _endDate!,
      );
      setState(() {
        _isLoading = false;
      });
      await Future.delayed(Duration(milliseconds: 500));

      if (mounted) {
        Navigator.of(context).push(
          AnimationUtils.bottomToTop(
            DertamAddPlaceToTrip(
              tripId: tripProvider.createTrip.data?.trip?.tripId.toString(),
            ),
          ),
        );
      }
    }
  }

  void _selectDate(DateTime date) {
    setState(() {
      if (_startDate == null) {
        _startDate = date;
      } else if (_endDate == null) {
        if (date.isAfter(_startDate!)) {
          _endDate = date;
        } else {
          _startDate = date;
          _endDate = null;
        }
      } else {
        _startDate = date;
        _endDate = null;
      }
    });
  }

  void _previousMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1);
    });
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
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
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(DertamSpacings.m),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: DertamSpacings.s),
                    Text(
                      "Choose your trip's start and end date",
                      style: DertamTextStyles.body.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    SizedBox(height: DertamSpacings.l),

                    // Calendar Widget - Using Combined Component
                    CalendarWidget(
                      currentMonth: _currentMonth,
                      startDate: _startDate,
                      endDate: _endDate,
                      onDateSelected: _selectDate,
                      onPreviousMonth: _previousMonth,
                      onNextMonth: _nextMonth,
                    ),

                    SizedBox(height: DertamSpacings.l),

                    // Date display
                    Container(
                      padding: EdgeInsets.all(DertamSpacings.l),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'From',
                                style: DertamTextStyles.body.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              Text(
                                _startDate != null
                                    ? _formatDate(_startDate!)
                                    : 'Select date',
                                style: DertamTextStyles.body.copyWith(
                                  fontWeight: FontWeight.w500,
                                  color: _startDate != null
                                      ? DertamColors.black
                                      : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: DertamSpacings.m),
                          Divider(color: Colors.grey[300]),
                          SizedBox(height: DertamSpacings.m),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'To',
                                style: DertamTextStyles.body.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              Text(
                                _endDate != null
                                    ? _formatDate(_endDate!)
                                    : 'Select date',
                                style: DertamTextStyles.body.copyWith(
                                  fontWeight: FontWeight.w500,
                                  color: _endDate != null
                                      ? DertamColors.black
                                      : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 100),
                  ],
                ),
              ),
            ),

            // Continue Button
            Container(
              padding: EdgeInsets.all(DertamSpacings.l),
              decoration: BoxDecoration(
                color: DertamColors.white,
                boxShadow: [
                  BoxShadow(
                    color: DertamColors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: SafeArea(
                child: DertamButton(
                  text: _isLoading ? 'Creating Trip...' : 'Continue',
                  onPressed:
                      (_startDate != null && _endDate != null && !_isLoading)
                      ? _createTrip
                      : () {},
                  backgroundColor: (_startDate != null && _endDate != null)
                      ? DertamColors.primaryDark
                      : Colors.grey[400],
                  isLoading: _isLoading,
                  width: double.infinity,
                ),
              ),
            ),
          ],
        ),
      ),
    );
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
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
