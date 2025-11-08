import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/auth_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/screen/auth_screen/login/dertam_login_screen.dart';
import 'package:mobile_frontend/ui/screen/home_screen/home_page.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class SplashBody extends StatefulWidget {
  const SplashBody({super.key});
  @override
  State<SplashBody> createState() => _SplashBodyState();
}

class _SplashBodyState extends State<SplashBody> with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoOpacityAnimation;
  late Animation<double> _textOpacityAnimation;
  late Animation<Offset> _textSlideAnimation;
  bool _isReady = false;

  @override
  void initState() {
    super.initState();

    // Logo animations
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _logoScaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: Curves.easeOutBack),
    );

    _logoOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: Curves.easeInOut),
    );

    // Text animations
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _textOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeInOut),
    );

    _textSlideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
          CurvedAnimation(parent: _textController, curve: Curves.easeOutCubic),
        );

    // Start animation sequence
    _startAnimationSequence();
  }

  void _startAnimationSequence() async {
    // Start logo animation
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    _logoController.forward();

    // Start text animation after logo animation
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    _textController.forward();

    // Show loading indicator and prepare for navigation
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;
    setState(() {
      _isReady = true;
    });

    // Initialize app after animations
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;
    _initializeApp();
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    try {
      // Get the auth provider
      final authProvider = context.read<AuthProvider>();
      // Try to get the stored token
      await authProvider.getUserToken();
      // Extract token from AsyncValue
      final userTokenAsync = authProvider.userToken;
      String? storedToken;
      if (userTokenAsync.state == AsyncValueState.success) {
        storedToken = userTokenAsync.data;
      }
      if (!mounted) return;
      // Prepare the next screen based on token availability
      Widget nextScreen;
      if (storedToken != null && storedToken.isNotEmpty) {
        // Token exists, initialize auth and navigate to home
        await authProvider.initializeAuth();
        debugPrint("✅ Token found, navigating to home");
        nextScreen = HomePage();
      } else {
        // No token found, navigate to login
        debugPrint("ℹ️ No token found, redirecting to login");
        nextScreen = const DertamLoginScreen();
      }
      if (!mounted) return;
      // Navigate with animation
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 800),
          pageBuilder: (context, animation, secondaryAnimation) => nextScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(0.0, 1.0);
            const end = Offset.zero;
            const curve = Curves.easeInOutCubic;
            var tween = Tween(
              begin: begin,
              end: end,
            ).chain(CurveTween(curve: curve));
            var offsetAnimation = animation.drive(tween);
            return SlideTransition(
              position: offsetAnimation,
              child: FadeTransition(opacity: animation, child: child),
            );
          },
        ),
      );
    } catch (e) {
      debugPrint("❌ Error during initialization: $e");
      if (!mounted) return;
      // Show error dialog if something goes wrong
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
                _initializeApp(); // Retry initialization
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
      backgroundColor: DertamColors.primaryDark,
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // Animated logo
            ScaleTransition(
              scale: _logoScaleAnimation,
              child: FadeTransition(
                opacity: _logoOpacityAnimation,
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: Image.asset(
                        "assets/images/dertam_logo.png",
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
            SlideTransition(
              position: _textSlideAnimation,
              child: FadeTransition(
                opacity: _textOpacityAnimation,
                child: Column(
                  children: const [
                    Text(
                      'Welcome to',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 22,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      'DerTam',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    Text(
                      'Application',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 22,
                        fontWeight: FontWeight.w500,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Loading indicator
            const SizedBox(height: 50),
            AnimatedOpacity(
              opacity: _isReady ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 400),
              child: const CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
