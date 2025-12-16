import 'dart:convert';

import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/restaurant_repository.dart';
import 'package:mobile_frontend/models/restaurant/food_category.dart';
import 'package:mobile_frontend/models/restaurant/food_menu.dart';

class LaravelRestaurantApiRepository extends RestaurantRepository {
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  @override
  Future<List<FoodCategory>> getMenuCategories() async {
    try {
      final getMenuCategoriesResponse = await FetchingData.getData(
        ApiEndpoint.getMenuCategories,
        _baseHeaders,
      );
      print(
        '🚀 [DEBUG] getMenuCategories response body: ${getMenuCategoriesResponse.body}',
      );
      if (getMenuCategoriesResponse.statusCode == 200) {
        final jsonResponse = json.decode(getMenuCategoriesResponse.body);
        final List<dynamic> categoriesData =
            jsonResponse['data'] as List<dynamic>;
        final categories = categoriesData
            .map(
              (categoryJson) =>
                  FoodCategory.fromJson(categoryJson as Map<String, dynamic>),
            )
            .toList();
        return categories;
      } else {
        throw Exception('Failed to load menu categories');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<MenuItemResponse> getMenuItems(String restaurantId) async {
    try {
      final getMenuItemsResponse = await FetchingData.getData(
        '${ApiEndpoint.getMenuItems}/$restaurantId',
        _baseHeaders,
      );
      print(
        '🚀 [DEBUG] getMenuItems response status: ${getMenuItemsResponse.statusCode}',
      );
      if (getMenuItemsResponse.statusCode == 200) {
        final jsonResponse = json.decode(getMenuItemsResponse.body);
        final menuItems = MenuItemResponse.fromJson(jsonResponse);
        return menuItems;
      } else {
        throw Exception('Failed to load menu items');
      }
    } catch (e) {
      rethrow;
    }
  }
}
