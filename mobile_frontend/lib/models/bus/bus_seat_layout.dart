import 'package:mobile_frontend/models/bus/bus_seat_deck.dart';

class BusSeatLayout {
  final BusSeatDeck? lowerDeck;
  final BusSeatDeck? upperDeck;
  const BusSeatLayout({this.lowerDeck, this.upperDeck});

  factory BusSeatLayout.fromJson(Map<String, dynamic> json) {
    final lowerDeckJson = json['lower_deck'] as Map<String, dynamic>?;
    final upperDeckJson = json['upper_deck'] as Map<String, dynamic>?;

    return BusSeatLayout(
      lowerDeck: lowerDeckJson != null
          ? BusSeatDeck.fromJson(lowerDeckJson)
          : null,
      upperDeck: upperDeckJson != null
          ? BusSeatDeck.fromJson(upperDeckJson)
          : null,
    );
  }
}
