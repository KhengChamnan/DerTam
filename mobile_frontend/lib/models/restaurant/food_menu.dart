/// Menu item model
class MenuItem {
  final String name;
  final String imageUrl;
  final String price;

  MenuItem({required this.name, required this.imageUrl, required this.price});

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      name: json['name'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      price: json['price'] ?? '',
    );
  }
  factory MenuItem.toJson(MenuItem item) {
    return MenuItem(
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
    );
  }
}
