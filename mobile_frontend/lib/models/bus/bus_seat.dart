class BusSeat {
  final int? id;
  final String? seatNumber;
  final String? status; // Additional cost for premium seats
  final String? price;
  final int? bookingItemId;

  const BusSeat({
    this.id,
    this.seatNumber,
    this.status,
    this.price,
    this.bookingItemId,
  });

  factory BusSeat.fromJson(Map<String, dynamic> json) {
    return BusSeat(
      id: json['id'] as int? ?? json['seat_id'] as int?,
      seatNumber:
          json['seat_no']?.toString() ?? json['seat_number']?.toString(),
      status: json['status']?.toString(),
      price: json['price']?.toString(),
      bookingItemId: json['booking_item_id'] as int?,
    );
  }
}
