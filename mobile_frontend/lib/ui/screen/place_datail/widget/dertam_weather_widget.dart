import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/service/dertam_weather_service.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class WeatherCard extends StatefulWidget {
  final double latitude;
  final double longitude;

  const WeatherCard({
    super.key,
    required this.latitude,
    required this.longitude,
  });

  @override
  State<WeatherCard> createState() => _WeatherCardState();
}

class _WeatherCardState extends State<WeatherCard> {
  final WeatherService _weatherService = WeatherService();
  WeatherData? _weatherData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchWeather();
  }

  Future<void> _fetchWeather() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    print(
      '🌤️ WeatherCard: Starting fetch for lat=${widget.latitude}, lon=${widget.longitude}',
    );

    try {
      final weather = await _weatherService.getWeatherByCoordinates(
        widget.latitude,
        widget.longitude,
      );

      print('🌤️ WeatherCard: Received weather data: $weather');

      if (mounted) {
        setState(() {
          _weatherData = weather;
          _isLoading = false;
          if (weather == null) {
            _error = 'Unable to fetch weather data. Check console for details.';
          }
        });
      }
    } catch (e) {
      print('❌ WeatherCard Error: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load weather: $e';
        });
      }
    }
  }

  String _getWeatherIconUrl(String iconCode) {
    return 'https://openweathermap.org/img/wn/$iconCode@2x.png';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingCard();
    }

    if (_error != null || _weatherData == null) {
      return _buildErrorCard();
    }

    return _buildWeatherCard();
  }

  Widget _buildLoadingCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            DertamColors.primaryBlue,
            DertamColors.primaryBlue.withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: CircularProgressIndicator(color: Colors.white),
      ),
    );
  }

  Widget _buildErrorCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off, color: Colors.grey, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _error ?? 'Weather unavailable',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchWeather),
        ],
      ),
    );
  }

  Widget _buildWeatherCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            DertamColors.primaryBlue,
            DertamColors.primaryBlue.withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: DertamColors.primaryBlue.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Weather Icon
          Image.network(
            _getWeatherIconUrl(_weatherData!.icon),
            width: 64,
            height: 64,
            errorBuilder: (context, error, stackTrace) =>
                const Icon(Icons.cloud, size: 64, color: Colors.white),
          ),
          const SizedBox(width: 16),
          // Temperature and Description
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_weatherData!.temperature.round()}°C',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  _weatherData!.description.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          // Additional Info
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  const Icon(Icons.water_drop, size: 16, color: Colors.white70),
                  const SizedBox(width: 4),
                  Text(
                    '${_weatherData!.humidity}%',
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.air, size: 16, color: Colors.white70),
                  const SizedBox(width: 4),
                  Text(
                    '${_weatherData!.windSpeed} m/s',
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
