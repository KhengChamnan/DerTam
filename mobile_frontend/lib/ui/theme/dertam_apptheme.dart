import 'package:flutter/material.dart';

///
/// Definition of App colors.
///
class DertamColors {
  // Primary colors
  static Color primaryDark = const Color(0xFF01015b);
  static Color primaryBlue = const Color(0xFF01015B);
  static Color primaryPurple = const Color(0xFF5740AD);
  static Color purple = const Color(0xFF5740AD);
  static Color backgroundAccent = const Color(0xFFEDEDED);

  // Gradient colors for buttons
  static Color gradientStart1 = const Color(0xFF2C41EE);
  static Color gradientEnd1 = const Color(0xFF192588);

  static Color gradientStart2 = const Color(0xFF3041EE);
  static Color gradientEnd2 = const Color(0xFF654CF5);
  static Color neutralLighter = const Color(0xFF92A7AB);
  static Color neutralDark = const Color(0xFF054752);
  static Color neutral = const Color(0xFF3d5c62);
  static Color neutralLight = const Color(0xFF708c91);

  static Color gradientStart3 = const Color(0xFF203EEC);
  static Color gradientEnd3 = const Color(0xFF724EF6);

  // Neutral colors
  static Color white = const Color(0xFFFFFFFF);
  static Color black = const Color(0xFF020202);
  static Color greyDark = const Color(0xFF212121);
  static Color orange = const Color(0xFFF5A522);

  // Background colors
  static Color backgroundLight = const Color(0xFFF5F5F5);
  static Color backgroundWhite = Colors.white;

  // Getters for semantic usage
  static Color get backgroundColor {
    return DertamColors.backgroundWhite;
  }

  static Color get textPrimary {
    return DertamColors.primaryDark;
  }

  static Color get textSecondary {
    return DertamColors.greyDark;
  }

  static Color get textLight {
    return DertamColors.white;
  }

  static Color get iconPrimary {
    return DertamColors.primaryPurple;
  }

  static Color get iconActive {
    return DertamColors.primaryBlue;
  }

  static Color get buttonPrimary {
    return DertamColors.primaryBlue;
  }

  static Color get divider {
    return DertamColors.black;
  }

  // Gradient definitions
  static LinearGradient get buttonGradient1 {
    return LinearGradient(
      colors: [gradientStart1, gradientEnd1],
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    );
  }

  static LinearGradient get buttonGradient2 {
    return LinearGradient(
      colors: [gradientStart2, gradientEnd2],
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    );
  }

  static LinearGradient get buttonGradient3 {
    return LinearGradient(
      colors: [gradientStart3, gradientEnd3],
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    );
  }

  static LinearGradient get buttonGradientReverse {
    return LinearGradient(
      colors: [gradientEnd1, gradientStart1],
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    );
  }
}

///
/// Definition of App text styles.
///
class DertamTextStyles {
  // Display styles
  static TextStyle heading = const TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    fontFamily: 'Inter',
  );

  static TextStyle title = const TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w500,
    fontFamily: 'Poppins',
  );

  static TextStyle subtitle = const TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w500,
    fontFamily: 'Inter',
  );

  // Body styles
  static TextStyle body = const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    fontFamily: 'Inter',
  );

  static TextStyle bodyMedium = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    fontFamily: 'Inter',
  );

  static TextStyle bodySmall = const TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    fontFamily: 'Inter',
  );

  // Label styles
  static TextStyle label = const TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    fontFamily: 'Inter',
  );

  static TextStyle labelSmall = const TextStyle(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    fontFamily: 'Roboto',
  );

  // Button style
  static TextStyle button = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: 'Inter',
  );

  static TextStyle buttonLarge = const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    fontFamily: 'Inter',
  );
}

///
/// Definition of App spacings, in pixels.
/// Basically extra small (xs), small (s), medium (m), large (l),
/// extra large (xl), extra extra large (xxl)
///
class DertamSpacings {
  static const double xs = 8;
  static const double s = 12;
  static const double m = 16;
  static const double l = 24;
  static const double xl = 32;
  static const double xxl = 40;

  // Border radius
  static const double radius = 16;
  static const double radiusSmall = 8;
  static const double radiusMedium = 12;
  static const double radiusLarge = 20;
  static const double radiusXLarge = 24;

  // Button specific
  static const double buttonRadius = 20;
  static const double buttonHeight = 42;
  static const double buttonPaddingHorizontal = 24;
  static const double buttonPaddingVertical = 12;
}

///
/// Definition of App icon sizes.
///
class DertamSize {
  static const double iconSmall = 20;
  static const double icon = 24;
  static const double iconMedium = 30;
  static const double iconLarge = 36;
  static const double iconXLarge = 42;

  // Tab bar specific
  static const double tabBarHeight = 89;
  static const double tabBarIconSize = 24;
  static const double tabBarIndicatorHeight = 5;
  static const double tabBarIndicatorWidth = 134;
  static const double tabBarBorderHeight = 1;
}

///
/// Definition of App Theme.
///
ThemeData dertamAppTheme = ThemeData(
  fontFamily: 'Inter',
  scaffoldBackgroundColor: DertamColors.backgroundWhite,
  primaryColor: DertamColors.primaryBlue,

  // AppBar theme
  appBarTheme: AppBarTheme(
    backgroundColor: DertamColors.white,
    foregroundColor: DertamColors.primaryDark,
    elevation: 0,
    centerTitle: true,
  ),

  // Bottom Navigation Bar theme
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: DertamColors.white,
    selectedItemColor: DertamColors.primaryBlue,
    unselectedItemColor: DertamColors.greyDark,
    type: BottomNavigationBarType.fixed,
    selectedLabelStyle: DertamTextStyles.labelSmall,
    unselectedLabelStyle: DertamTextStyles.labelSmall,
    elevation: 0,
  ),

  // Button theme
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: DertamColors.primaryBlue,
      foregroundColor: DertamColors.white,
      textStyle: DertamTextStyles.button,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DertamSpacings.buttonRadius),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: DertamSpacings.buttonPaddingHorizontal,
        vertical: DertamSpacings.buttonPaddingVertical,
      ),
      minimumSize: const Size(0, DertamSpacings.buttonHeight),
    ),
  ),

  // Text Button theme
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: DertamColors.primaryBlue,
      textStyle: DertamTextStyles.button,
    ),
  ),

  // Input decoration theme
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: DertamColors.backgroundLight,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(DertamSpacings.radius),
      borderSide: BorderSide.none,
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(DertamSpacings.radius),
      borderSide: BorderSide.none,
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(DertamSpacings.radius),
      borderSide: BorderSide(color: DertamColors.primaryBlue, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(
      horizontal: DertamSpacings.m,
      vertical: DertamSpacings.s,
    ),
  ),

  // Card theme
  cardTheme: CardThemeData(
    color: DertamColors.white,
    elevation: 2,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(DertamSpacings.radius),
    ),
  ),

  // Divider theme
  dividerTheme: DividerThemeData(color: DertamColors.black, thickness: 1),

  // Icon theme
  iconTheme: IconThemeData(
    color: DertamColors.iconPrimary,
    size: DertamSize.icon,
  ),

  // Color scheme
  colorScheme: ColorScheme.light(
    primary: DertamColors.primaryBlue,
    secondary: DertamColors.primaryPurple,
    surface: DertamColors.white,
    onPrimary: DertamColors.white,
    onSecondary: DertamColors.white,
    onSurface: DertamColors.primaryDark,
  ),
);
