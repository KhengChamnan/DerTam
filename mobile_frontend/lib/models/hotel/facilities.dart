class Facilities {
  final String id;
  final String name;
  final String hotelId;

  Facilities({required this.id, required this.name, required this.hotelId});

  factory Facilities.fromJson(Map<String, dynamic> json) {
    return Facilities(
      id: json['facility_id'] ?? '',
      name: json['facility_name'] ?? '',
      hotelId: json['property_id'] ?? '',
    );
  }
}
