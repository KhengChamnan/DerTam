import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile_frontend/data/service/dertam_route_service.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class RouteMapPage extends StatefulWidget {
  final int tripId;
  final int dayNumber;
  final double? startLatitude;
  final double? startLongitude;

  const RouteMapPage({
    super.key,
    required this.tripId,
    required this.dayNumber,
    this.startLatitude,
    this.startLongitude,
  });

  @override
  _RouteMapPageState createState() => _RouteMapPageState();
}

class _RouteMapPageState extends State<RouteMapPage> {
  List<RoutePoint> _routePoints = [];
  late final RouteService routeService;

  @override
  void initState() {
    super.initState();
    routeService = RouteService(
      baseUrl: 'https://dertam-classical-route.onrender.com',
    );
    // Load route after frame is built to access context safely
    WidgetsBinding.instance.addPostFrameCallback((_) {
      loadRoute();
    });
  }

  Future<void> loadRoute() async {
    // Get auth token from provider
    final authProvider = context.read<AuthProvider>();
    final authToken = authProvider.authToken;

    print('=== DEBUG loadRoute ===');
    print('TripId: ${widget.tripId}');
    print('DayNumber: ${widget.dayNumber}');
    print('AuthToken: ${authToken ?? 'NO TOKEN'}');

    try {
      final points = await routeService.fetchRoute(
        widget.tripId,
        widget.dayNumber,
        authToken: authToken,
        startLatitude: widget.startLatitude,
        startLongitude: widget.startLongitude,
      );
      print('Points fetched: ${points.length}');
      print('Points: $points');

      setState(() {
        _routePoints = points;
      });
    } catch (e) {
      print('Error loading route: $e');
      rethrow;
    }
  }

  void _onMarkerTap(RoutePoint point) {
    setState(() {});

    // Show bottom sheet with directions button
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              point.name,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            if (point.order > 0)
              Text(
                'Stop #${point.order}',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _launchDirections(point),
              icon: Icon(Icons.directions),
              label: Text('Get Directions'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchDirections(RoutePoint point) async {
    final url = RouteService.getGoogleMapsDirectionsUrl(
      destinationLat: point.latLng.latitude,
      destinationLng: point.latLng.longitude,
      startLat: widget.startLatitude,
      startLng: widget.startLongitude,
    );

    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Could not open Google Maps')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  spreadRadius: 0,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new,
                color: DertamColors.primaryDark,
                size: 20,
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        title: Text(
          'Optimized Route',
          style: TextStyle(
            color: DertamColors.primaryDark,
            fontWeight: FontWeight.bold,
            fontSize: 24,
          ),
        ),
      ),
      body: _routePoints.isEmpty
          ? Center(child: CircularProgressIndicator())
          : FlutterMap(
              options: MapOptions(
                initialCenter: _routePoints.isNotEmpty
                    ? _routePoints[0].latLng
                    : LatLng(0, 0), // fallback center
                initialZoom: 12.0,
                minZoom: 2.0,
                maxZoom: 30.0,
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                  userAgentPackageName: 'com.dertam.mobile',
                  subdomains: const ['a', 'b', 'c', 'd'],
                  minZoom: 0.0,
                  maxZoom: 19.0,
                  minNativeZoom: 0,
                  maxNativeZoom: 19,
                  tileDimension: 256,
                  tileSize: 256.0,
                  keepBuffer: 2,
                  panBuffer: 1,
                ),
                MarkerLayer(
                  markers: _routePoints
                      .map(
                        (p) => Marker(
                          width: 120,
                          height: 80,
                          point: p.latLng,
                          child: GestureDetector(
                            onTap: () => _onMarkerTap(p),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: p.order == 0
                                          ? Colors.blue
                                          : Colors.red,
                                      width: 2,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black26,
                                        blurRadius: 4,
                                        offset: Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    p.order == 0
                                        ? 'Start'
                                        : '${p.order}. ${p.name}',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Icon(
                                  p.order == 0
                                      ? Icons.my_location
                                      : Icons.location_on,
                                  color: p.order == 0
                                      ? Colors.blue
                                      : Colors.red,
                                  size: 40,
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
    );
  }
}
