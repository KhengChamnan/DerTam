class PlaceCategory {
  final int categoryId;
  final String categoryName;
  PlaceCategory({required this.categoryId, required this.categoryName});
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PlaceCategory && other.categoryId == categoryId;
  }

  @override
  int get hashCode => categoryId.hashCode;
  @override
  String toString() {
    return 'PlaceCategory{categoryId: $categoryId, categoryName: $categoryName}';
  }
}
