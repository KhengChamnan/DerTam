class TripShareResponse {
  final bool success;
  final String message;
  final TripShareData? data;

  TripShareResponse({required this.success, required this.message, this.data});

  factory TripShareResponse.fromJson(Map<String, dynamic> json) {
    return TripShareResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null
          ? TripShareData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'message': message, 'data': data?.toJson()};
  }
}

class TripShareData {
  final String shareLink;
  final String token;
  final DateTime expiresAt;
  final DateTime createdAt;

  TripShareData({
    required this.shareLink,
    required this.token,
    required this.expiresAt,
    required this.createdAt,
  });

  factory TripShareData.fromJson(Map<String, dynamic> json) {
    return TripShareData(
      shareLink: json['share_link'] as String,
      token: json['token'] as String,
      expiresAt: DateTime.parse(json['expires_at'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'share_link': shareLink,
      'token': token,
      'expires_at': expiresAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
