import 'package:mobile_frontend/data/dto/province_dto.dart';

class ProvinceCategoryDetail {
  final int? provinceCategoryID;
  final String? provinceCategoryName;
  final String? categoryDescription;

  ProvinceCategoryDetail({
    this.provinceCategoryID,
    this.provinceCategoryName,
    this.categoryDescription,
  });

  factory ProvinceCategoryDetail.fromJson(Map<String, dynamic> json) {
    return ProvinceCategoryDetail(
      provinceCategoryID: json['province_categoryID'] ?? 0,
      provinceCategoryName: json['province_categoryName'] ?? '',
      categoryDescription: json['category_description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'province_categoryID': provinceCategoryID,
      'province_categoryName': provinceCategoryName,
      'category_description': categoryDescription,
    };
  }
}

class ProvinceResponseData {
  final List<ProvinceCategoryDetail> provinces;
  final int? total;
  ProvinceResponseData({required this.provinces, this.total});
  factory ProvinceResponseData.fromBusBooking(Map<String, dynamic> json) {
    final dataJson = json['provinces'] as List<dynamic>? ?? [];
    return ProvinceResponseData(
      provinces: dataJson
          .map(
            (item) => ProvinceDto.fromBusBookingProvince(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
      total: json['total'] as int? ?? 0,
    );
  }
}
