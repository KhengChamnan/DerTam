import 'package:flutter/material.dart';
import 'widgets/splash_body.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});
  static String nameRoute = "/splash";
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SplashBody(),
    );
  }
}
