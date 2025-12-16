import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/restaurant_repository.dart';
import 'package:mobile_frontend/models/restaurant/food_category.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class RestaurantProvider extends ChangeNotifier {
  final RestaurantRepository restaurantRepository;
  RestaurantProvider({required this.restaurantRepository});
  AsyncValue<List<FoodCategory>> _menuCategoriesSnapshot = AsyncValue.empty();
  AsyncValue<MenuItemResponse> _menuItems = AsyncValue.empty();

  ///Getter
  AsyncValue<List<FoodCategory>> get menuCategoriesSnapshot =>
      _menuCategoriesSnapshot;
  AsyncValue<MenuItemResponse> get menuItems => _menuItems;

  Future<void> fetchMenuCategories() async {
    _menuCategoriesSnapshot = AsyncValue.loading();
    notifyListeners();
    try {
      final categories = await restaurantRepository.getMenuCategories();
      if (categories.isEmpty) {
        _menuCategoriesSnapshot = AsyncValue.empty();
      } else {
        _menuCategoriesSnapshot = AsyncValue.success(categories);
      }
    } catch (e) {
      _menuCategoriesSnapshot = AsyncValue.error(e);
    }
    notifyListeners();
  }

  Future<void> fetchMenuItems(String restaurantId) async {
    _menuItems = AsyncValue.loading();
    notifyListeners();
    try {
      final items = await restaurantRepository.getMenuItems(restaurantId);
      if (items.data.menuItems.isEmpty) {
        _menuItems = AsyncValue.empty();
      } else {
        _menuItems = AsyncValue.success(items);
      }
    } catch (e) {
      _menuItems = AsyncValue.error(e);
    }
    notifyListeners();
  }

  /// Clear all cached restaurant data - call this on logout
  void clearAll() {
    _menuCategoriesSnapshot = AsyncValue.empty();
    _menuItems = AsyncValue.empty();
    notifyListeners();
  }
}
