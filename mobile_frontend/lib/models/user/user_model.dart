class User {
  final String userId;
  final String name;
  final String email;
  final String? googleId;
  final String? avatar;
  final String? password;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? token;
  final String? confirmPassword;

  User({
    required this.userId,
    required this.name,
    required this.email,
    this.googleId,
    this.avatar,
    this.password,
    this.confirmPassword,
    this.createdAt,
    this.updatedAt,
    this.token,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['user_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      googleId: json['googole_id'] ?? '',
      avatar: json['avatar'] ?? '',
      password: json['password'] ?? '',
      confirmPassword: json['confirm_password'] ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      token: json['token'] ?? '',
    );
  }
  factory User.toJson(User user) {
    return User(
      userId: user.userId,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      avatar: user.avatar,
      password: user.password,
      confirmPassword: user.confirmPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: user.token,
    );
  }
}
