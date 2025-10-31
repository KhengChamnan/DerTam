import 'package:mobile_frontend/models/trips/trip_days.dart';

class Trip {
  final String id;
  final String userId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;
  final List<Day> days;
  final String? budgetId;
  final String? province;

  Trip({
    required this.id,
    required this.userId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
    required this.days,
    this.budgetId,
    this.province,
  });
  
}
