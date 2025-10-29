class OwnerUser {
  final int id;
  final String name;
  final String email;
  final String profilePhotoUrl;

  OwnerUser({
    required this.id,
    required this.name,
    required this.email,
    required this.profilePhotoUrl,
  });

  factory OwnerUser.fromJson(Map<String, dynamic> json) {
    return OwnerUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      profilePhotoUrl: json['profile_photo_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profile_photo_url': profilePhotoUrl,
    };
  }
}
