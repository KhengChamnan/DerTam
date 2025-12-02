import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_budget_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_bus_booking_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_hotel_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_trip_api_repository.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/screen/splash/spalsh_screen.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_place_api_repository.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';

void main() {
  final authRepository = LaravelAuthApiRepository();
  final hotelRepository = LaravelHotelApiRepository(authRepository);
  final tripRepository = LaravelTripApiRepository(authRepository);
  final budgetRepository = LaravelBudgetApiRepository(authRepository);
  final busBookingRepository = LaravelBusBookingApiRepository(authRepository);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(authRepository: LaravelAuthApiRepository()),
        ),
        ChangeNotifierProvider(
          create: (_) => PlaceProvider(repository: LaravelPlaceApiRepository()),
        ),
        ChangeNotifierProvider(
          create: (_) => HotelProvider(repository: hotelRepository),
        ),
        ChangeNotifierProvider(
          create: (_) => TripProvider(tripRepository: tripRepository),
        ),
        ChangeNotifierProvider(
          create: (_) => BudgetProvider(repository: budgetRepository),
        ),
        ChangeNotifierProvider(
          create: (_) =>
              BusBookingProvider(busBookingRepository: busBookingRepository),
        ),
      ],
      child: MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  late AppLinks _appLinks;
  StreamSubscription? _linkSubscription;

  @override
  void initState() {
    super.initState();
    _initDeepLinkListener();
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  // Handle deep links
  Future<void> _initDeepLinkListener() async {
    _appLinks = AppLinks();
    // Handle links when app is already running
    _linkSubscription = _appLinks.uriLinkStream.listen(
      (Uri uri) {
        _handleDeepLink(uri);
      },
      onError: (err) {
        print('Deep link error: $err');
      },
    );
    // Handle initial link when app opens from a closed state
    try {
      final uri = await _appLinks.getInitialLink();
      if (uri != null) {
        _handleDeepLink(uri);
      }
    } catch (err) {
      print('Error getting initial link: $err');
    }
  }

  void _handleDeepLink(Uri uri) {
    print('Deep link received: $uri');
    // Check if it's a payment return link
    if (uri.scheme == 'myapp' && uri.host == 'payment') {
      final status = uri.queryParameters['status'];
      final tranId = uri.queryParameters['tran_id'];
      print('Payment status: $status, Transaction ID: $tranId');
      // Navigate to home or payment success screen
      if (status == 'success') {
        // Show success and navigate to home
        navigatorKey.currentState?.pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => HomePage()),
          (route) => false,
        );
        // Show success message
        Future.delayed(const Duration(milliseconds: 500), () {
          final context = navigatorKey.currentContext;
          if (context != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Payment successful! Transaction ID: $tranId'),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        });
      } else {
        // Handle payment failure or cancellation
        Future.delayed(const Duration(milliseconds: 500), () {
          final context = navigatorKey.currentContext;
          if (context != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Payment ${status ?? "failed"}. Please try again.',
                ),
                backgroundColor: Colors.orange,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'DerTam',
      debugShowCheckedModeBanner: false,
      theme: dertamAppTheme,
      home: SplashScreen(),
    );
  }
}
