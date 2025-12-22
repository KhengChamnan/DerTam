import 'package:flutter/material.dart';

class AnimationUtils {
  AnimationUtils._(); // Prevent instantiation

  /// Default animation duration
  static const int _defaultSpeed = 400;

  /// Helper for slide transitions
  static Route<T> slideRoute<T>({
    required Widget screen,
    required Offset begin,
    Curve curve = Curves.easeInOut,
    int speed = _defaultSpeed,
    bool isOpaque = true,
    Color? barrierColor,
  }) {
    return PageRouteBuilder<T>(
      opaque: isOpaque,
      barrierColor: barrierColor,
      transitionDuration: Duration(milliseconds: speed),
      pageBuilder: (_, __, ___) => screen,
      transitionsBuilder: (_, animation, __, child) {
        final tween = Tween(
          begin: begin,
          end: Offset.zero,
        ).chain(CurveTween(curve: curve));

        return SlideTransition(position: animation.drive(tween), child: child);
      },
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Slide Animations
  //////////////////////////////////////////////////////////////////////////////

  static Route<T> bottomToTop<T>(Widget screen) =>
      slideRoute(screen: screen, begin: const Offset(0, 1));

  static Route<T> topToBottom<T>(Widget screen) =>
      slideRoute(screen: screen, begin: const Offset(0, -1));

  static Route<T> rightToLeft<T>(Widget screen) =>
      slideRoute(screen: screen, begin: const Offset(1, 0));

  static Route<T> leftToRight<T>(Widget screen) =>
      slideRoute(screen: screen, begin: const Offset(-1, 0));

  //////////////////////////////////////////////////////////////////////////////
  /// Fade Transition
  //////////////////////////////////////////////////////////////////////////////

  static Route<T> fade<T>(Widget screen, {int speed = _defaultSpeed}) {
    return PageRouteBuilder<T>(
      transitionDuration: Duration(milliseconds: speed),
      pageBuilder: (_, __, ___) => screen,
      transitionsBuilder: (_, animation, __, child) {
        return FadeTransition(opacity: animation, child: child);
      },
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Popup Scale with Fade Transition
  //////////////////////////////////////////////////////////////////////////////

  static Route<T> popup<T>(Widget screen, {int speed = _defaultSpeed}) {
    return PageRouteBuilder<T>(
      opaque: false,
      barrierColor: Colors.black54,
      transitionDuration: Duration(milliseconds: speed),
      pageBuilder: (_, __, ___) => screen,
      transitionsBuilder: (_, animation, __, child) {
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutBack,
        );

        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(scale: curved, child: child),
        );
      },
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Navigation Bar Transition (Tab switch)
  /// Slide slightly + fade = smooth UX for bottom navbar tabs
  //////////////////////////////////////////////////////////////////////////////

  static Widget navAnimation({
    required Widget child,
    required int index,
    Duration duration = const Duration(milliseconds: _defaultSpeed),
  }) {
    return AnimatedSwitcher(
      duration: duration,
      switchOutCurve: Curves.easeIn,
      switchInCurve: Curves.easeOut,

      transitionBuilder: (widget, animation) {
        final slide = Tween<Offset>(
          begin: const Offset(0.05, 0),
          end: Offset.zero,
        ).animate(animation);

        return FadeTransition(
          opacity: animation,
          child: SlideTransition(position: slide, child: widget),
        );
      },

      child: KeyedSubtree(key: ValueKey(index), child: child),
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  /// Top Sheet (Fixed Height Popup)
  //////////////////////////////////////////////////////////////////////////////

  static Route<T> c<T>(
    Widget screen, {
    double maxHeightFactor = 0.5,
    int speed = _defaultSpeed,
  }) {
    return PageRouteBuilder<T>(
      opaque: false,
      barrierColor: Colors.black54,
      transitionDuration: Duration(milliseconds: speed),
      pageBuilder: (context, _, __) {
        return GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Scaffold(
            backgroundColor: Colors.black45,
            body: Align(
              alignment: Alignment.topCenter,
              child: FractionallySizedBox(
                widthFactor: 1,
                heightFactor: maxHeightFactor,
                child: Material(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(20),
                  ),
                  child: screen,
                ),
              ),
            ),
          ),
        );
      },
      transitionsBuilder: (_, animation, __, child) {
        return SlideTransition(
          position: Tween(
            begin: const Offset(0, -1),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: child,
        );
      },
    );
  }
}
