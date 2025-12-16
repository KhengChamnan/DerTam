import 'package:mobile_frontend/models/bus/bus_seat_layout.dart';
import 'package:mobile_frontend/models/bus/bus_schedule.dart';

class BusDetailResponse {
  final BusSchedule schedule;
  final BusSeatLayout busLayout;
  const BusDetailResponse({required this.schedule, required this.busLayout});

  factory BusDetailResponse.fromJson(Map<String, dynamic> json) {
    final busData = json['data'] ?? json;

    // Handle both 'schedule' (singular) and 'schedules' (plural) keys
    final scheduleJson =
        (busData['schedule'] ?? busData['journeys']) as Map<String, dynamic>?;
    if (scheduleJson == null) {
      throw FormatException('Missing schedule data in response');
    }

    final layoutJson = busData['seat_layout'] as Map<String, dynamic>?;
    if (layoutJson == null) {
      throw FormatException('Missing seat_layout data in response');
    }

    return BusDetailResponse(
      schedule: BusSchedule.fromJson(scheduleJson),
      busLayout: BusSeatLayout.fromJson(layoutJson),
    );
  }
}
