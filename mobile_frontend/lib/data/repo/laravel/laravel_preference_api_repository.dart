import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/repo/abstract/preference_repository.dart';

class LaravelPreferenceApiRepository extends PreferenceRepository {
  @override
  Future<Map<String, dynamic>> submitPreferences(Map<String, dynamic> payload) async {
    try {
      final url = Uri.parse('${ApiEndpoint.baseUrl}/user_preference');
      final response = await http.post(url, headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }, body: jsonEncode(payload));

      final body = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'statusCode': response.statusCode,
          'message': body['message'] ?? 'Preferences submitted',
          'data': body['data'] ?? body,
        };
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'message': body['message'] ?? 'Failed',
          'errors': body['errors'] ?? {},
        };
      }
    } catch (e) {
      return {
        'success': false,
        'statusCode': 500,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
}
