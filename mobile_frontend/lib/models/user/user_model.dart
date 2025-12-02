class User {
  final int id;
  final String name;
  final String email;
  final int? age;
  final String? googleId;
  final String? avatar;
  final String? password;
  final String? imageUrl;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? token;
  final String? confirmPassword;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.imageUrl,
    this.googleId,
    this.avatar,
    this.age,
    this.password,
    this.confirmPassword,
    this.createdAt,
    this.updatedAt,
    this.token,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    print(
      '🔍 User.fromJson - profile_photo_url value: ${json['profile_photo_url']}',
    );

    // Fix ui-avatars.com URL to use PNG format (SVG not supported by NetworkImage)
    String? profileUrl = json['profile_photo_url'];
    if (profileUrl != null &&
        profileUrl.contains('ui-avatars.com') &&
        !profileUrl.contains('format=')) {
      profileUrl = '$profileUrl&format=png';
    }

    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      age: json['age'] ?? 0,
      imageUrl: profileUrl ?? '',
      googleId: json['google_id'] ?? json['googole_id'] ?? '',
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
  factory User.fromGoodgleLogin(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      age: json['age'] ?? 0,
      imageUrl:
          json['profile_image'] ??
          json['profile_image_url'] ??
          json['profile_photo_url'] ??
          '',
      googleId: json['google_id'] ?? json['googole_id'] ?? '',
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
}
