import 'package:mobile_frontend/models/favorite/favorite_model.dart';

abstract class FavoriteRepository {
  Future<void> addFavorite(String userId, String itemId);
  Future<void> removeFavorite(String userId, String itemId);
  Future<List<FavoriteModel>> getUserFavorites(String userId);
}
