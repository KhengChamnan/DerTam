import 'package:mobile_frontend/models/place/place_category.dart';

class CategoryDTO {
  static PlaceCategory fromJson(Map<String, dynamic> json) {
    try {
      return PlaceCategory(
        categoryId: json['id'] as int? ?? 0,
        categoryName: json['name'] as String? ?? '',
      );
    } catch (e) {
      print('Error parsing PlaceCategory from JSON: $e');
      rethrow;
    }
  }

  static Map<String, dynamic> toJson(PlaceCategory category) {
    try {
      return {'id': category.categoryId, 'name': category.categoryName};
    } catch (e) {
      print('Error converting PlaceCategory to JSON: $e');
      rethrow;
    }
  }
}
