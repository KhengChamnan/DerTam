abstract class AuthRepository { 
  Future<Map<String, dynamic>> sendPasswordResetEmail(String email);
  Future<Map<String, dynamic>> verifyPin(String email, String pin);
  Future<Map<String, dynamic>> resetPassword(String email, String newPassword);
  Future<Map<String, dynamic>> register(String name, String email, String password,String confirmPassword);
  Future<Map<String, dynamic>> login(String email, String password);
  Future<Map<String, dynamic>> googleSignIn();
}