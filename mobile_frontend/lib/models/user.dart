class User {
  final int id;
  final String name;
  final String email;
  final String? googleId;
  final String? avatar;//image path
  final DateTime? emailVerifiedAt;
  final String? password; // usually not returned from API
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? token; // for API authentication (not in DB, but useful in app)
  final String? confirmPassword;
  final String? pin; // for password reset

  User({
    required this.id,
    required this.name,
    required this.email,
    this.googleId,
    this.avatar,
    this.emailVerifiedAt,
    this.password,
    this.confirmPassword,
    this.createdAt,
    this.updatedAt,
    this.token,
    this.pin,
  });

  
}
