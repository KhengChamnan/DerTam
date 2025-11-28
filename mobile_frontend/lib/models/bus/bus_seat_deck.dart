import 'package:mobile_frontend/models/bus/bus_seat.dart';

class BusSeatDeck {
  final List<String>? columns;
  final List<BusSeat>? seats;
  const BusSeatDeck({this.seats, this.columns});
  factory BusSeatDeck.fromJson(Map<String, dynamic> json) {
    final seatList = (json['seats'] as List<dynamic>?)
        ?.map((seatJson) => BusSeat.fromJson(seatJson as Map<String, dynamic>))
        .toList();
    final columnList = (json['columns'] as List<dynamic>?)
        ?.map((col) => col as String)
        .toList();
    return BusSeatDeck(seats: seatList, columns: columnList);
  }
}
