
class AuthDto {
  /// Convert login request to JSON
  static Map<String, dynamic> loginToJson(String email, String password) {
    return {
      'email': email,
      'password': password,
    };
  }

  /// Convert register request to JSON
  static Map<String, dynamic> registerToJson(String name, String email, String password) {
    return {
      'name': name,
      'email': email,
      'password': password,
      'c_password':password
    };
  }

  /// Convert password reset request to JSON
  static Map<String, dynamic> resetPasswordToJson(String email) {
    return {
      'email': email,
    };
  }

  /// Convert verify PIN request to JSON
  static Map<String, dynamic> verifyPinToJson(String email, String pin) {
    return {
      'email': email,
      'token': pin,
    };
  }

  /// Convert new password request to JSON
  static Map<String, dynamic> newPasswordToJson(String email, String password) {
    return {
      'email': email,
      'password': password,
      'password_confirmation': password,
    };
  }

  static Map<String, dynamic> googleSignInFromJson() {
    return {
      
    };
  }
}