class BusSeat {
  final int? id;
  final String? seatNumber;
  final String? status; // Additional cost for premium seats
  final String? price;

  const BusSeat({this.id, this.seatNumber, this.status, this.price});

  factory BusSeat.fromJson(Map<String, dynamic> json) {
    return BusSeat(
      id: json['id'] as int?,
      seatNumber: json['seat_no'] as String?,
      status: json['status'] as String?,
      price: json['price'] as String?,
    );
  }
}
