import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;

class FetchingData {
  static const String baseUrl = "https://g9-capstone-project-ll.onrender.com";

  static Future<http.Response> postData(
    String provideUrl,
    Map<String, dynamic> param,
    Map<String, String> headers,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    dynamic body;
    if (headers['Content-Type'] == 'application/x-www-form-urlencoded') {
      body = param;
    } else {
      body = json.encode(param);
    }
    final response = await http.post(url, headers: headers, body: body);
    return response;
  }

  static Future<http.Response> postHeader(
    String provideUrl,
    Map<String, String> param,
    Map<String, dynamic> parBody,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    dynamic requestBody;
    if (param.containsKey('Content-Type') &&
        param['Content-Type'] == 'application/json') {
      requestBody = json.encode(parBody);
    } else {
      requestBody = parBody;
    }
    try {
      final response = await http
          .post(url, headers: param, body: requestBody)
          .timeout(const Duration(seconds: 30));
      return response;
    } catch (e) {
      rethrow;
    }
  }
  static Future<http.Response> updateData(
    String provideUrl,
    Map<String, String> param,
    Map<String, dynamic> parBody,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    dynamic requestBody;
    if (param.containsKey('Content-Type') &&
        param['Content-Type'] == 'application/json') {
      requestBody = json.encode(parBody);
    } else {
      requestBody = parBody;
    }
    try {
      final response = await http
          .patch(url, headers: param, body: requestBody)
          .timeout(const Duration(seconds: 30));
      return response;
    } catch (e) {
      rethrow;
    }
  }

  static Future<http.Response> postWithHeaderOnly(
    String provideUrl,
    Map<String, String> headers,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    try {
      final response = await http
          .post(url, headers: headers)
          .timeout(const Duration(seconds: 30));
      return response;
    } catch (e) {
      rethrow;
    }
  }

  static Future<http.Response> deleteData(
    String provideUrl,
    Map<String, String> headers,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    try {
      final response = await http
          .delete(url, headers: headers)
          .timeout(const Duration(seconds: 30));
      return response;
    } catch (e) {
      rethrow;
    }
  }

  static Future<http.Response> getData(
    String provideUrl,
    Map<String, String> param,
  ) async {
    // Normalize the provided URL path and avoid accidental double slashes or
    // passing a full URL into Uri.https (which would produce invalid URIs).
    final host = baseUrl.replaceAll('https://', '').replaceAll('http://', '');
    String path = provideUrl;
    if (path.startsWith('/')) path = path.substring(1);
    final url = Uri.https(host, path);
    print('🌐 [FetchingData] Constructed URL: $url');
    print('🌐 [FetchingData] Base URL: $host');
    print('🌐 [FetchingData] Provided URL: $provideUrl');
    try {
      // Add a reasonable timeout so requests don't hang indefinitely.
      final response = await http
          .get(url, headers: param)
          .timeout(const Duration(seconds: 15));
      print('🌐 [FetchingData] Response status: ${response.statusCode}');
      return response;
    } catch (e) {
      print('❌ [FetchingData] Error or timeout: $e');
      rethrow;
    }
  }

  static Future<http.Response> getDataPar(
    String provideUrl,
    Map<String, String> param,
    Map<String, String> header,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl, param);
    try {
      final response = await http
          .get(url, headers: header)
          .timeout(const Duration(seconds: 10));
      return response;
    } on SocketException {
      throw Exception('Network connection failed');
    } on TimeoutException {
      throw Exception('Request timed out');
    }
  }

  static Future<http.Response> updateDate(
    String provideUrl,
    Map<String, String> param,
    Map<String, dynamic> parBody,
  ) async {
    var url = Uri.https(baseUrl.replaceAll('https://', ''), provideUrl);
    dynamic requestBody = parBody;
    if (param.containsKey('Content-Type') &&
        param['Content-Type'] == 'application/json') {
      requestBody = json.encode(parBody);
    }
    final response = await http.post(url, headers: param, body: requestBody);
    return response;
  }
}
