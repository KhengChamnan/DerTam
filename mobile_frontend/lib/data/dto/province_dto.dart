import 'package:mobile_frontend/models/province/province_category_detail.dart';

class ProvinceDto {
  static ProvinceCategoryDetail fromBusBookingProvince(
    Map<String, dynamic> json,
  ) {
    // Handle nested data structure or direct province object
    final provinceData = json['data'] ?? json;
    return ProvinceCategoryDetail(
      provinceCategoryID: provinceData['id'] ?? 0,
      provinceCategoryName: provinceData['name'] ?? '',
    );
  }
}
