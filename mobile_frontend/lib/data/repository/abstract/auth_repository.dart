import 'package:mobile_frontend/models/user/user_model.dart';

abstract class AuthRepository {
  Future<User> sendPasswordResetEmail(String email);
  Future<User> verifyPin(String email, String pin);
  Future<User> resetPassword(String email, String newPassword);
  Future<User> register(
    String name,
    String email,
    String password,
    String confirmPassword,
  );
  Future<User> login(String email, String password);
  Future<User> googleSignIn();
  Future<void> saveToken(String token);
  Future<String?> getToken();
  Future<void> logOut();
}
