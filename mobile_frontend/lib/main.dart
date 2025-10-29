import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_hotel_api_repository.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/splash/spalsh_screen.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_place_api_repository.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

void main() {
  runApp(MyApp());
}
class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(authRepository: LaravelAuthApiRepository()),
        ),
        ChangeNotifierProvider(
          create: (_) => PlaceProvider(repository: LaravelPlaceApiRepository()),
        ),
        ChangeNotifierProvider(
          create: (_) => HotelProvider(repository: LaravelHotelApiRepository()),
        ),
      ],
      child: MaterialApp(
        title: 'DerTam',
        debugShowCheckedModeBanner: false,
        theme: dertamAppTheme,
        home: SplashScreen(),
      ),
    );
  }
}
