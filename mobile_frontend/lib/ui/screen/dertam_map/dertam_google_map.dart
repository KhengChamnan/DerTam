import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:location/location.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_frontend/data/repository/google_map_service.dart';
import 'dart:async';

import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class MapNavigationScreen extends StatefulWidget {
  final GeoPoint destinationLocation;
  final String destinationName;

  const MapNavigationScreen({
    super.key,
    required this.destinationLocation,
    required this.destinationName,
  });

  @override
  State<MapNavigationScreen> createState() => _MapNavigationScreenState();
}

class _MapNavigationScreenState extends State<MapNavigationScreen> {
  final Completer<GoogleMapController> _controller = Completer();
  final Location _locationService = Location();
  final DirectionsService _directionsService = DirectionsService();

  LatLng? _currentLocation;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};
  String _distance = 'Calculating...';
  String _duration = 'Calculating...';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState(); 
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled;
      PermissionStatus permissionGranted;
      LocationData locationData;

      // Check if location service is enabled
      serviceEnabled = await _locationService.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _locationService.requestService();
        if (!serviceEnabled) {
          print("Location services not enabled");
          setState(() {
            _isLoading = false;
            _distance = 'Location services not enabled';
          });
          return;
        }
      }

      // Check if permission is granted
      permissionGranted = await _locationService.hasPermission();
      if (permissionGranted == PermissionStatus.denied) {
        permissionGranted = await _locationService.requestPermission();
        if (permissionGranted != PermissionStatus.granted) {
          print("Location permission denied");
          setState(() {
            _isLoading = false;
            _distance = 'Location permission denied';
          });
          return;
        }
      }

      print("Getting location...");
      locationData = await _locationService.getLocation();
      print(
          "Location received: ${locationData.latitude}, ${locationData.longitude}");

      setState(() {
        _currentLocation =
            LatLng(locationData.latitude!, locationData.longitude!);
      });

      // Add a marker for current location initially
      _markers.add(
        Marker(
          markerId: const MarkerId('currentLocation'),
          position: _currentLocation!,
          infoWindow: const InfoWindow(title: 'Your Location'),
        ),
      );

      // Add a marker for destination
      final LatLng destinationLatLng = LatLng(
          widget.destinationLocation.latitude,
          widget.destinationLocation.longitude);

      _markers.add(
        Marker(
          markerId: const MarkerId('destination'),
          position: destinationLatLng,
          infoWindow: InfoWindow(title: widget.destinationName),
        ),
      );

      setState(() {}); // Refresh to show markers

      // Move the camera to the current location
      if (_currentLocation != null) {
        final GoogleMapController controller = await _controller.future;
        controller.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              target: _currentLocation!,
              zoom: 15.0, // Adjust zoom level as needed
            ),
          ),
        );
      }

      // Get directions after a short delay
      Future.delayed(const Duration(milliseconds: 500), () {
        _getDirections();
      });
    } catch (e) {
      print("Error getting location: $e");
      setState(() {
        _isLoading = false;
        _distance =
            'Error: ${e.toString().substring(0, e.toString().length > 30 ? 30 : e.toString().length)}';
      });
    }
  }

  Future<void> _getDirections() async {
    if (_currentLocation == null) return;

    try {
      // Convert GeoPoint to LatLng
      final LatLng destinationLatLng = LatLng(
          widget.destinationLocation.latitude,
          widget.destinationLocation.longitude);

      print("Fetching directions from $_currentLocation to $destinationLatLng");

      // Clear previous polylines if any
      setState(() {
        _polylines.clear();
      });

      // Get directions
      final directions = await _directionsService.getDirections(
        origin: _currentLocation!,
        destination: destinationLatLng,
      );

      print("Directions received successfully with route data");

      // Create a polyline
      final List<LatLng> polylineCoordinates =
          directions['polylineCoordinates'];

      setState(() {
        _polylines.add(
          Polyline(
            polylineId: const PolylineId('route'),
            points: polylineCoordinates,
            color: Colors.blue,
            width: 5,
          ),
        );

        _distance = directions['distance'];
        _duration = directions['duration'];
        _isLoading = false;
      });

      // Adjust camera to show the route
      _fitBounds(polylineCoordinates);
    } catch (e) {
      print("Error getting directions: $e");

      // Show error and fallback to straight line
      final LatLng destinationLatLng = LatLng(
          widget.destinationLocation.latitude,
          widget.destinationLocation.longitude);

      setState(() {
        // Create a straight line as fallback
        _polylines.add(
          Polyline(
            polylineId: const PolylineId('fallback_route'),
            points: [_currentLocation!, destinationLatLng],
            color: Colors.red,
            width: 3,
            patterns: [PatternItem.dash(10), PatternItem.gap(5)], // Dashed line
          ),
        );

        _isLoading = false;
        _distance = 'Route unavailable';
        _duration = 'Check internet and API key';
      });

      // Show a snackbar with the error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not get route: ${e.toString().split(':').last}'),
          duration: const Duration(seconds: 5),
          action: SnackBarAction(
            label: 'Retry',
            onPressed: () {
              setState(() {
                _isLoading = true;
              });
              _getDirections();
            },
          ),
        ),
      );

      // Zoom to show both markers
      _fitMarkers();
    }
  }

  Future<void> _fitBounds(List<LatLng> points) async {
    if (points.isEmpty) return;

    double minLat = points[0].latitude;
    double maxLat = points[0].latitude;
    double minLng = points[0].longitude;
    double maxLng = points[0].longitude;

    for (var point in points) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    final GoogleMapController controller = await _controller.future;
    controller.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        100, // padding
      ),
    );
  }

  // Add method to fit map to markers when we can't get a proper route
  Future<void> _fitMarkers() async {
    if (_markers.isEmpty) return;

    final GoogleMapController controller = await _controller.future;

    double minLat = 90;
    double maxLat = -90;
    double minLng = 180;
    double maxLng = -180;

    for (final marker in _markers) {
      if (marker.position.latitude < minLat) minLat = marker.position.latitude;
      if (marker.position.latitude > maxLat) maxLat = marker.position.latitude;
      if (marker.position.longitude < minLng) {
        minLng = marker.position.longitude;
      }
      if (marker.position.longitude > maxLng) {
        maxLng = marker.position.longitude;
      }
    }

    // Add some padding
    minLat -= 0.05;
    maxLat += 0.05;
    minLng -= 0.05;
    maxLng += 0.05;

    controller.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        100, // padding
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: Icon(Icons.arrow_back_ios_new),
        ),
        backgroundColor: DertamColors.white,
        title: Text(widget.destinationName),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _isLoading = true;
              });
              _getCurrentLocation();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          _currentLocation == null
              ? const Center(child: CircularProgressIndicator())
              : GoogleMap(
                  onMapCreated: (GoogleMapController controller) {
                    _controller.complete(controller);
                    print("Map created successfully in main app!");
                    setState(() {
                      _isLoading = false; // Update UI only after map is ready
                    });
                  },
                  initialCameraPosition: CameraPosition(
                    target: _currentLocation ??
                        const LatLng(
                            -6.2088, 106.8456), // Default to Jakarta if null
                    zoom: 12.0,
                  ),
                  markers: _markers,
                  polylines: _polylines,
                  mapType: MapType.normal,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  zoomControlsEnabled: true,
                ),
          if (!_isLoading)
            Positioned(
              bottom: 20,
              left: 20,
              right: 20,
              child: SingleChildScrollView(
                // Wrap with SingleChildScrollView to prevent overflow
                child: Card(
                  elevation: 5,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.destinationName,
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text('Distance: $_distance'),
                            const SizedBox(width: 16),
                            const Icon(Icons.access_time, size: 16),
                            Text('Duration: $_duration'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
