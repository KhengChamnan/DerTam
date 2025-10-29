class ProvinceCategoryDetail {
  final int provinceCategoryID;
  final String provinceCategoryName;
  final String categoryDescription;

  ProvinceCategoryDetail({
    required this.provinceCategoryID,
    required this.provinceCategoryName,
    required this.categoryDescription,
  });

  factory ProvinceCategoryDetail.fromJson(Map<String, dynamic> json) {
    return ProvinceCategoryDetail(
      provinceCategoryID: json['province_categoryID'] ?? 0,
      provinceCategoryName: json['province_categoryName'] ?? '',
      categoryDescription: json['category_description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'province_categoryID': provinceCategoryID,
      'province_categoryName': provinceCategoryName,
      'category_description': categoryDescription,
    };
  }
}
