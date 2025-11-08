import 'package:cloud_firestore/cloud_firestore.dart' as firestore;
import 'package:mobile_frontend/models/place/place.dart';

class Day {
  final String id; // This will be 'day1', 'day2', etc.
  final int dayNumber;
  final List<Place> places; // Places from main places collection
  final List<String> placeIds; // Store the IDs of places for this day

  Day({
    required this.id,
    required this.dayNumber,
    required this.places,
    required this.placeIds,
  });

  factory Day.fromFirestore(
    firestore.QueryDocumentSnapshot<Map<String, dynamic>> doc,
    List<Place> places,
    List<String> placeIds,
  ) {
    final data = doc.data();
    return Day(
      id: doc.id,
      dayNumber: data['dayNumber'] as int,
      places: places,
      placeIds: placeIds,
    );
  }

  Map<String, dynamic> toMap() {
    return {'dayNumber': dayNumber, 'placeIds': placeIds};
  }
}
