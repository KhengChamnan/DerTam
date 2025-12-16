class FoodCategory {
  final int? menuId;
  final String? categoryName;
  FoodCategory({this.menuId, this.categoryName});
  factory FoodCategory.fromJson(Map<String, dynamic> json) {
    return FoodCategory(
      menuId: json['menu_category_id'] as int?,
      categoryName: json['name'] as String?,
    );
  }
}
