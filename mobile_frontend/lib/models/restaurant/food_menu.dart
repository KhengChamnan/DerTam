class MenuItemResponse {
  final bool success;
  final String message;
  final MenuData data;

  MenuItemResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory MenuItemResponse.fromJson(Map<String, dynamic> json) {
    return MenuItemResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: MenuData.fromJson(json['data'] ?? {}),
    );
  }
}

class MenuData {
  final List<MenuItem> menuItems;

  MenuData({required this.menuItems});

  factory MenuData.fromJson(Map<String, dynamic> json) {
    return MenuData(
      menuItems:
          (json['menu_items'] as List<dynamic>?)
              ?.map((item) => MenuItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class MenuItem {
  final int menuItemId;
  final String name;
  final double price;
  final String? description;
  final int menuCategoryId;
  final String? imageUrl;
  final String menuCategoryName;

  MenuItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    this.description,
    required this.menuCategoryId,
    this.imageUrl,
    required this.menuCategoryName,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      menuItemId: json['menu_item_id'] ?? 0,
      name: json['name'] ?? '',
      price: (json['price'] is int)
          ? (json['price'] as int).toDouble()
          : (json['price'] ?? 0.0),
      description: json['description'],
      menuCategoryId: json['menu_category_id'] ?? 0,
      imageUrl: json['image_url'],
      menuCategoryName: json['menu_category_name'] ?? '',
    );
  }
}
