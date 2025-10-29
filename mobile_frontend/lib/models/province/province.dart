class Province {
  final String id;
  final String name;

  Province({required this.id, required this.name});

  factory Province.fromJson(Map<String, dynamic> json) {
    return Province(
      id: json['province_categoryID'] ?? '',
      name: json['province_categoryName'] ?? '',
    );
  }
  Map<String, dynamic> toJson() {
    return {'province_categoryID': id, 'province_categoryName': name};
  }
}
