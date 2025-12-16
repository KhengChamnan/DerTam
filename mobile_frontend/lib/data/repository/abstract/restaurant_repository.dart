import 'package:mobile_frontend/models/restaurant/food_category.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';

abstract class RestaurantRepository {
  Future<MenuItemResponse> getMenuItems(String restaurantId);
  Future<List<FoodCategory>> getMenuCategories();
}