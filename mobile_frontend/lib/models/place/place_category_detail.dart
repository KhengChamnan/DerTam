class PlaceCategoryDetail {
  final int placeCategoryID;
  final String categoryName;
  final String categoryDescription;

  PlaceCategoryDetail({
    required this.placeCategoryID,
    required this.categoryName,
    required this.categoryDescription,
  });

  factory PlaceCategoryDetail.fromJson(Map<String, dynamic> json) {
    return PlaceCategoryDetail(
      placeCategoryID: json['placeCategoryID'] ?? 0,
      categoryName: json['category_name'] ?? '',
      categoryDescription: json['category_description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'placeCategoryID': placeCategoryID,
      'category_name': categoryName,
      'category_description': categoryDescription,
    };
  }
}
