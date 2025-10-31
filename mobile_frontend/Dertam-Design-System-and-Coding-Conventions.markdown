# DerTam DESIGN SYSTEM

You can find in the `/doc` folder a link to a start **Figma Design System** and **user flows**.

- You can create your **own copy** to it along the development.
- This file allows you to **identify each widget settings** (color, spaces, icons) and anticipate generic app widget needs.

*Visual: Figma Design System and user flows*

# DerTam CODING CONVENTIONS

## FOLDERS

The project shall be organized around the following folders:
|----------|--------------------------------------------------|
| model    | Contains data models                             |
| service  | Contains service layer code                      |
| theme    | Contains theming and styling constants           |
| utils    | Contains utility functions and helper classes    |
| widgets  | Contains reusable app widgets                    |
| screens  | Contains UI screens and their related components |

## MODEL

- Model classes are located in the `/model` folder.
- Models should be immutable whenever possible and include:
  - `copyWith()` method
  - Proper implementations of `==` (equals) and `hashCode` for comparison
  - A `toString()` method for debugging purposes
- Models should only manage the data structure and its manipulation.
- No persistence, Flutter, or networking code should be present.
- Model classes should be grouped into subfolders based on logical topics:
  - `/model/users`
  - `/model/attendance`
  - `/model/leave_requests`

## SERVICE

- Services are located in the `/service` folder.
- For now, services just provide static test data. We will update service later on.

## THEME

- Themes are defined in the `/theme` folder.
- `theme.dart` file defines:
  - `ColorsPalmColors`
  - `TextStylesPalmTextStyles`
  - `SpacingPalmSpacings`
  - `IconsPalmIcons`
- All widgets should reference `theme.dart` for styling instead of hardcoding styles.

## UTILS

- Utility classes are placed in the `/utils` folder.
- These classes contain static methods for common tasks:
  - Formatting dates
  - Handling screen animations, etc.

## APP WIDGETS

- App (reusable) widgets are placed in the `/widgets` folder.
- Widgets should be grouped into subfolders based on UI categories:
  - `actions/` (e.g., buttons)
  - `inputs/` (e.g., text fields)
  - `display/` (e.g., cards, lists)
  - `notifications/` (e.g., snackbars, alerts)
- Naming convention: App Widgets should be prefixed with the app's short name.
  - `palm_button.dart`

## SCREEN WIDGETS

- Screens are located in the `/screens` folder.
- Each screen has its own subfolder: `/screens/{screen_name}/`
- Screen-specific widgets are placed in `/screens/{screen_name}/widgets/`
  - Example: `/screen/leave_request/widgets/leave_request_form.dart`
- Naming convention:
  - Screen widgets should be prefixed with the screen name.
  - Example: A history tile widget for the leave request screen: `leave_request_history_tile.dart`

## APP WIDGETS VS SCREEN WIDGETS

- The diagram defines the dependencies between widgets and themes. The App Theme is used by App Widgets, which in turn are used by Screen Widgets. Screen Widgets are then used by the Screen. Additionally, all screens and widgets shall refer to the App Theme constants for color, text styles, and other styling elements.

## COMMENTS

Three types of comments are required:

### Explaining a Class

```dart
/// This screen allows users to:
/// - Enter leave requests and submit them.
/// - Select previous leave requests and reuse them.
```

### Explaining Statements

```dart
startDate = null;                   // User must select the start date
requestDate = DateTime.now();       // Defaults to now
endDate = null;                     // User must select the end date
requestedDays = 1;                  // Default: 1 day
```

### Clarifying Steps

```dart
// 1 - Notify the listener
widget.onRequestChanged(newText);
// 2 - Update the cross icon
setState(() {});
```

# NAMING CONVENTIONS

### Identifiers

| Type       | Convention                     |
|------------|--------------------------------|
| Class      | UpperCamelCase                |
| Methods    | lowerCamelCase                |
| Variables  | lowerCamelCase                |
| File Names | lowercase_with_underscores.dart |

- Class names, Enums, typedefs, and type parameters should capitalize the first letter of each word.

### Getters

- Use getters to expose computed values from the model.

```dart
bool get showEndDatePlaceholder => endDate == null;
String get dateLabel => DateTimeUtils.formatDateTime(requestDate);
```

### Type Explicitly

- Always specify types explicitly.

Bad:
```dart
final dynamic initLeaveRequests;
```

Good:
```dart
final LeaveRequest initLeaveRequests;
```

### Naming Best Practices

- **Use terms consistently.**

Good:
```dart
pageCount // A field
updatePageCount() // Consistent with pageCount
toSomething() // Consistent with Iterable's toList()
```

Bad:
```dart
renumberPages() // Different from pageCount
convertToSomething() // Inconsistent with toX() precedent
wrappedAsSomething() // Inconsistent with asX() precedent
```