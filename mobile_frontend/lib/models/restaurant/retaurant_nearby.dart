class NearByRestaurant {
  final String placeId;
  final String restaurantId;
  final String name;
  final String imageUrl;
  final String location;
  final String rating;
  NearByRestaurant({
    required this.placeId,
    required this.restaurantId,
    required this.name,
    required this.imageUrl,
    required this.location,
    required this.rating,
  });
  factory NearByRestaurant.fromJson(Map<String, dynamic> json) {
    return NearByRestaurant(
      placeId: json['placeId'] ?? '',
      restaurantId: json['restaurantId'] ?? '',
      name: json['name'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      location: json['location'] ?? '',
      rating: json['rating'] ?? '0.0',
    );
  }

  factory NearByRestaurant.toJson(NearByRestaurant restaurant) {
    return NearByRestaurant(
      placeId: restaurant.placeId,
      restaurantId: restaurant.restaurantId,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl,
      location: restaurant.location,
      rating: restaurant.rating,
    );
  }
}
