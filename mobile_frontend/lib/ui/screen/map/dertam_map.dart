import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile_frontend/data/service/dertam_route_service.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class RouteMapPage extends StatefulWidget {
  final int tripId;
  final int dayNumber;

  const RouteMapPage({
    super.key,
    required this.tripId,
    required this.dayNumber,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Optimized Route')),
      body: _routePoints.isEmpty
          ? Center(child: CircularProgressIndicator())
          : FlutterMap(
              options: MapOptions(
                initialCenter: _routePoints.isNotEmpty
                    ? _routePoints[0].latLng
                    : LatLng(0, 0), // fallback center
                initialZoom: 9.0,
                minZoom: 2.0,
                maxZoom: 19.0,
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
                // PolylineLayer(
                //   polylines: [
                //     Polyline(
                //       points: _routePoints.map((p) => p.latLng).toList(),
                //       strokeWidth: 4.0,
                //       color: Colors.blue,
                //     ),
                //   ],
                // ),
                MarkerLayer(
                  markers: _routePoints
                      .map(
                        (p) => Marker(
                          width: 80,
                          height: 80,
                          point: p.latLng,
                          child: GestureDetector(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${p.order + 1}. ${p.name}'),
                                ),
                              );
                            },
                            child: Icon(
                              Icons.location_on,
                              color: Colors.red,
                              size: 40,
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
