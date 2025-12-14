import 'package:mobile_frontend/models/user/user_model.dart';
import 'package:share_plus/share_plus.dart';

abstract class AuthRepository {
  Future<User> sendPasswordResetEmail(String email);
  Future<User> verifyPin(String email, String pin);
  Future<User> resetPassword(
    String email,
    String password,
    String passwordConfirmation,
  );
  Future<User> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  );
  Future<User> login(String email, String password);
  Future<User> googleSignIn();
  Future<void> saveToken(String token);
  Future<User> getUserInfo();
  Future<String?> getToken();
  Future<void> logOut();
  Future<void> updateProfile(
    String? name,
    String? email,
    String? phone,
    String? age,
    String? gender,
    XFile? profileImage,
  );
  Future<void> changePassword(
    String currentPassword,
    String newPassword,
    String confirmPassword,
  );
}
