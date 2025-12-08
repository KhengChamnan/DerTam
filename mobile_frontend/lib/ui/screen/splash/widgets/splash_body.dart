import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/screen/user_preference/dertam_user_preferrence.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class SplashBody extends StatefulWidget {
  const SplashBody({super.key});

  @override
  State<SplashBody> createState() => _SplashBodyState();
}

class _SplashBodyState extends State<SplashBody> {
  bool _isPreparing = false;

  @override
  void initState() {
    super.initState();
    // short visible delay then initialize app
    Future.delayed(const Duration(seconds: 8), () {
      if (!mounted) return;
      setState(() => _isPreparing = true);
      _initializeApp();
    });
  }

  Future<void> _initializeApp() async {
    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.getUserToken();
      final tokenAsync = authProvider.userToken;
      String? storedToken;
      if (tokenAsync.state == AsyncValueState.success) {
        storedToken = tokenAsync.data;
      }

      Widget nextScreen;
      if (storedToken != null && storedToken.isNotEmpty) {
        await authProvider.initializeAuth();

        // Check if user has completed preferences
        await authProvider.checkPreferencesCompleted();
        final preferencesCompleted = authProvider.hasCompletedPreferences;

        if (preferencesCompleted.state == AsyncValueState.success &&
            preferencesCompleted.data == false) {
          // First time user - show preference screen
          nextScreen = const DertamUserPreferrence();
        } else {
          // Existing user - go to home
          nextScreen = HomePage();
        }
      } else {
        nextScreen = const DertamLoginScreen();
      }

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 600),
          pageBuilder: (context, animation, secondaryAnimation) => nextScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(0.0, 0.04);
            const end = Offset.zero;
            final tween = Tween(
              begin: begin,
              end: end,
            ).chain(CurveTween(curve: Curves.easeInOut));
            return SlideTransition(
              position: animation.drive(tween),
              child: FadeTransition(opacity: animation, child: child),
            );
          },
        ),
      );
    } catch (e) {
      if (!mounted) return;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Error'),
          content: Text('Failed to initialize app: ${e.toString()}'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _initializeApp();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Full screen static splash image (use assets/images/splash.png)
          Positioned.fill(
            child: Image.asset('assets/images/splash.png', fit: BoxFit.cover),
          ),

          // optional small preparing indicator
          if (_isPreparing)
            Positioned(
              bottom: MediaQuery.of(context).size.height * 0.06,
              left: 0,
              right: 0,
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.0,
                        color: DertamColors.primaryDark,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Preparing app...',
                      style: TextStyle(color: Colors.grey[700], fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
