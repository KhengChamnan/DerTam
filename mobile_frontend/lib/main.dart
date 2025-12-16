import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_budget_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_bus_booking_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_hotel_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_restaurant_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_trip_api_repository.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/providers/restaurant_provider.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/screen/splash/spalsh_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_join_trip_screen.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_place_api_repository.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/widgets/display/dertam_booking_succes_screen.dart';

void main() {
  // Create a single shared auth repository instance for all providers
  final authRepository = LaravelAuthApiRepository();
  final hotelRepository = LaravelHotelApiRepository(authRepository);
  final tripRepository = LaravelTripApiRepository(authRepository);
  final budgetRepository = LaravelBudgetApiRepository(authRepository);
  final busBookingRepository = LaravelBusBookingApiRepository(authRepository);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(
            authRepository: authRepository,
          ), // Use shared instance
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
        ChangeNotifierProvider(
          create: (_) => RestaurantProvider(
            restaurantRepository: LaravelRestaurantApiRepository(),
          ),
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
      if (status == 'success') {
        // Show success dialog
        final context = navigatorKey.currentContext;
        if (context != null) {
          Future.delayed(const Duration(seconds: 5), () {
            final ctx = navigatorKey.currentContext;
            if (ctx != null) {
              DertamBookingSuccessDialog.show(ctx);
            }
          });
          navigatorKey.currentState?.pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const HomePage()),
            (route) => false,
          );
        }
      } else {
        navigatorKey.currentState?.pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const HomePage()),
          (route) => false,
        );
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
    } else if (uri.pathSegments.contains('share') &&
        uri.pathSegments.length >= 3) {
      final shareToken = uri.pathSegments.last;
      // Navigate to JoinTripScreen with the token
      navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (context) => JoinTripScreen(shareToken: shareToken),
        ),
      );
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
