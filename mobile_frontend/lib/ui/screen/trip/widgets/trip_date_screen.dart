import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/select_place.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/calender.dart';

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

  final List<Map<String, dynamic>> _mockTrips = [];

  Future<void> _createTrip() async {
    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select both start and end dates'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      final tripId = DateTime.now().millisecondsSinceEpoch.toString();
      final newTrip = {
        'id': tripId,
        'tripName': widget.tripName,
        'startDate': _startDate!.toIso8601String(),
        'endDate': _endDate!.toIso8601String(),
        'createdAt': DateTime.now().toIso8601String(),
      };

      _mockTrips.add(newTrip);

      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Trip "${widget.tripName}" created successfully!'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 1),
        ),
      );

      await Future.delayed(Duration(milliseconds: 500));

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => SelectPlaceScreen(
              tripId: tripId,
              tripName: widget.tripName,
              startDate: _startDate!,
              endDate: _endDate!,
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
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: DertamColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.tripName,
          style: DertamTextStyles.title.copyWith(color: DertamColors.black),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
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
                  color: Colors.black.withOpacity(0.1),
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
