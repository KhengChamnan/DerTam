// Example: How to integrate seat selection with backend API

import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/widget/dertam_select_seat.dart';

// EXAMPLE 1: Basic Static Usage (for testing)
class BasicExample extends StatelessWidget {
  const BasicExample({super.key});

  @override
  Widget build(BuildContext context) {
    return DertamSelectSeat(
      fromLocation: 'Kelaniya',
      toLocation: 'Colombo',
      date: '08th - Dec - 2024 | Sunday',
      busName: 'Perera Travels',
      busType: 'A/C Sleeper (2+2)',
      departureTime: '9:00 AM',
      arrivalTime: '9:45 AM',
      duration: '45 Min',
      pricePerSeat: 200,
      seatsLeft: 15,
    );
  }
}

// EXAMPLE 2: Dynamic Data from Bus Model
class BusModel {
  final String id;
  final String name;
  final String type;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final int pricePerSeat;
  final int seatsLeft;
  final List<List<int>>? lowerDeckSeats;
  final List<List<int>>? upperDeckSeats;

  BusModel({
    required this.id,
    required this.name,
    required this.type,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.pricePerSeat,
    required this.seatsLeft,
    this.lowerDeckSeats,
    this.upperDeckSeats,
  });
}

class DynamicExample extends StatelessWidget {
  final BusModel bus;
  final String fromLocation;
  final String toLocation;
  final String date;

  const DynamicExample({
    super.key,
    required this.bus,
    required this.fromLocation,
    required this.toLocation,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return DertamSelectSeat(
      fromLocation: fromLocation,
      toLocation: toLocation,
      date: date,
      busName: bus.name,
      busType: bus.type,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: bus.duration,
      pricePerSeat: bus.pricePerSeat,
      seatsLeft: bus.seatsLeft,
    );
  }
}

// EXAMPLE 3: Fetching Seat Data from API
class ApiIntegrationExample extends StatefulWidget {
  final String busId;
  final String fromLocation;
  final String toLocation;
  final String date;

  const ApiIntegrationExample({
    super.key,
    required this.busId,
    required this.fromLocation,
    required this.toLocation,
    required this.date,
  });

  @override
  State<ApiIntegrationExample> createState() => _ApiIntegrationExampleState();
}

class _ApiIntegrationExampleState extends State<ApiIntegrationExample> {
  bool isLoading = true;
  BusModel? busData;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBusDetails();
  }

  Future<void> _fetchBusDetails() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      // TODO: Replace with your actual API call
      // final response = await http.get(
      //   Uri.parse('YOUR_API_URL/buses/${widget.busId}/seats'),
      // );
      // final data = jsonDecode(response.body);

      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));

      // Parse response and create BusModel
      setState(() {
        busData = BusModel(
          id: widget.busId,
          name: 'Perera Travels',
          type: 'A/C Sleeper (2+2)',
          departureTime: '9:00 AM',
          arrivalTime: '9:45 AM',
          duration: '45 Min',
          pricePerSeat: 200,
          seatsLeft: 15,
          // Parse seat layout from API
          lowerDeckSeats: [
            [1, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
          ],
          upperDeckSeats: [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
        );
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load bus details: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(errorMessage!),
              SizedBox(height: 16),
              ElevatedButton(onPressed: _fetchBusDetails, child: Text('Retry')),
            ],
          ),
        ),
      );
    }

    return DertamSelectSeat(
      fromLocation: widget.fromLocation,
      toLocation: widget.toLocation,
      date: widget.date,
      busName: busData!.name,
      busType: busData!.type,
      departureTime: busData!.departureTime,
      arrivalTime: busData!.arrivalTime,
      duration: busData!.duration,
      pricePerSeat: busData!.pricePerSeat,
      seatsLeft: busData!.seatsLeft,
    );
  }
}

// EXAMPLE 4: Backend API Response Format
/*
Expected API Response Format for Seat Layout:

GET /api/buses/{busId}/seats

Response:
{
  "busId": "bus_123",
  "name": "Perera Travels",
  "type": "A/C Sleeper (2+2)",
  "departureTime": "9:00 AM",
  "arrivalTime": "9:45 AM",
  "duration": "45 Min",
  "pricePerSeat": 200,
  "seatsLeft": 15,
  "lowerDeck": [
    {"row": 0, "col": 0, "status": "booked", "seatNumber": "A1"},
    {"row": 0, "col": 1, "status": "available", "seatNumber": "B1"},
    {"row": 0, "col": 2, "status": "available", "seatNumber": "C1"},
    {"row": 0, "col": 3, "status": "available", "seatNumber": "D1"},
    // ... more seats
  ],
  "upperDeck": [
    // Similar structure
  ]
}

To convert to the seat grid format:
- "available" → 0
- "booked" → 1
- "selected" → 2 (for user's previously selected seats)
*/

// EXAMPLE 5: Booking Seats to Backend
class BookingExample {
  Future<void> bookSeats({
    required String busId,
    required List<int> seatNumbers,
    required String userId,
  }) async {
    try {
      // TODO: Replace with your actual API call
      // final response = await http.post(
      //   Uri.parse('YOUR_API_URL/bookings'),
      //   headers: {'Content-Type': 'application/json'},
      //   body: jsonEncode({
      //     'busId': busId,
      //     'seatNumbers': seatNumbers,
      //     'userId': userId,
      //   }),
      // );

      // Handle response
      print('Booking seats: $seatNumbers for bus: $busId');

      // On success, navigate to confirmation screen
      // Navigator.push(context, MaterialPageRoute(...));
    } catch (e) {
      print('Booking failed: $e');
      // Show error message
    }
  }
}

// EXAMPLE 6: Real-time Seat Updates with WebSocket
class RealtimeSeatExample extends StatefulWidget {
  final String busId;

  const RealtimeSeatExample({super.key, required this.busId});

  @override
  State<RealtimeSeatExample> createState() => _RealtimeSeatExampleState();
}

class _RealtimeSeatExampleState extends State<RealtimeSeatExample> {
  // WebSocket? _socket;
  List<List<int>> seatLayout = [];

  @override
  void initState() {
    super.initState();
    // _connectWebSocket();
  }

  // void _connectWebSocket() {
  //   _socket = WebSocket.connect('ws://your-server/seats/${widget.busId}');
  //   _socket?.listen((data) {
  //     // Parse seat update
  //     final update = jsonDecode(data);
  //     setState(() {
  //       // Update specific seat status
  //       seatLayout[update['row']][update['col']] = update['status'];
  //     });
  //   });
  // }

  @override
  void dispose() {
    // _socket?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(); // Your seat selection UI
  }
}
