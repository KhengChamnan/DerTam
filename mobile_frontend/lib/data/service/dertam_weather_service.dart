import 'dart:convert';
import 'package:http/http.dart' as http;

class WeatherData {
  final double temperature;
  final String description;
  final String icon;
  final int humidity;
  final double windSpeed;

  WeatherData({
    required this.temperature,
    required this.description,
    required this.icon,
    required this.humidity,
    required this.windSpeed,
  });

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    return WeatherData(
      temperature: (json['main']['temp'] as num).toDouble(),
      description: json['weather'][0]['description'],
      icon: json['weather'][0]['icon'],
      humidity: json['main']['humidity'],
      windSpeed: (json['wind']['speed'] as num).toDouble(),
    );
  }
}

class WeatherService {
  static const String _apiKey = '7deae017e6618cf98de29d193ca1fbf0';
  static const String _baseUrl =
      'https://api.openweathermap.org/data/2.5/weather';

  Future<WeatherData?> getWeatherByCoordinates(double lat, double lon) async {
    try {
      final url = '$_baseUrl?lat=$lat&lon=$lon&appid=$_apiKey&units=metric';
      print('🌤️ Weather API URL: $url');
      print('🌤️ Fetching weather for lat: $lat, lon: $lon');

      final response = await http.get(Uri.parse(url));

      print('🌤️ Response status code: ${response.statusCode}');
      print('🌤️ Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🌤️ Parsed data successfully');
        return WeatherData.fromJson(data);
      } else if (response.statusCode == 401) {
        print(
          '❌ API Key is invalid or not activated yet. New keys take up to 2 hours to activate.',
        );
        return null;
      } else if (response.statusCode == 404) {
        print('❌ Location not found');
        return null;
      } else {
        print('❌ Failed with status: ${response.statusCode}');
        return null;
      }
    } catch (e, stackTrace) {
      print('❌ Error fetching weather: $e');
      print('❌ Stack trace: $stackTrace');
      return null;
    }
  }
}
