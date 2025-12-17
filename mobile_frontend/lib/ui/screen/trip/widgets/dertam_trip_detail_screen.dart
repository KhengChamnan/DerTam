import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_frontend/ui/screen/place_datail/place_detailed.dart';
import 'package:share_plus/share_plus.dart';
import 'package:location/location.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:mobile_frontend/ui/screen/budget/dertam_set_buget_screen.dart';
import 'package:mobile_frontend/ui/screen/budget/dertam_budget_detail_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/dertam_trip_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_review_trip_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_place_card.dart';
import 'package:mobile_frontend/ui/screen/dertam_map/dertam_map.dart';
import 'package:provider/provider.dart';

class TripDetailScreen extends StatefulWidget {
  final String tripId;
  const TripDetailScreen({super.key, required this.tripId});
  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final tripProvider = context.read<TripProvider>();
      tripProvider.fetchTripDetail(widget.tripId);
    });
  }

  void _openBudget(BuildContext context) async {
    final tripProvider = context.read<TripProvider>().getTripDetail;
    final budgetProvider = context.read<BudgetProvider>();
    final tripId = tripProvider.data?.data.tripId.toString() ?? '';

    if (tripId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip ID not found'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    try {
      // Try to fetch budget for this trip
      await budgetProvider.getBudgetDetail(tripId);
      final budgetState = budgetProvider.getBudgetDetails;
      // Check if budget exists - check state is success and has valid budget data
      if (budgetState.state == AsyncValueState.success &&
          budgetState.data != null &&
          budgetState.data!.totalBudget != null &&
          budgetState.data!.totalBudget! > 0) {
        // Budget exists - navigate to budget detail screen
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BudgetScreen(
                tripId: tripId,
                tripStartDate:
                    tripProvider.data?.data.startDate ?? DateTime.now(),
                tripEndDate: tripProvider.data?.data.endDate ?? DateTime.now(),
              ),
            ),
          );
        }
      } else {
        // Budget doesn't exist - navigate to set budget screen
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SetBudgetScreen(
                tripId: tripId,
                tripName: tripProvider.data?.data.tripName ?? 'Trip not found',
                startDate: tripProvider.data?.data.startDate ?? DateTime.now(),
                endDate: tripProvider.data?.data.endDate ?? DateTime.now(),
              ),
            ),
          );
        }
      }
    } catch (e) {
      // Budget fetch failed - navigate to set budget screen
      print('Error fetching budget: $e');
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => SetBudgetScreen(
              tripId: tripId,
              tripName: tripProvider.data?.data.tripName ?? 'Trip not found',
              startDate: tripProvider.data?.data.startDate ?? DateTime.now(),
              endDate: tripProvider.data?.data.endDate ?? DateTime.now(),
            ),
          ),
        );
      }
    }
  }

  void _navigateToMap(int totalDays, String tripId) async {
    // Get user's current location
    Location location = Location();
    double? userLat;
    double? userLng;

    try {
      // Check if location service is enabled
      bool serviceEnabled = await location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await location.requestService();
        if (!serviceEnabled) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Location service is disabled'),
                backgroundColor: Colors.orange,
              ),
            );
          }
          // Continue without location
        }
      }

      // Check if permission is granted
      PermissionStatus permissionGranted = await location.hasPermission();
      if (permissionGranted == PermissionStatus.denied) {
        permissionGranted = await location.requestPermission();
        if (permissionGranted != PermissionStatus.granted) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Location permission denied'),
                backgroundColor: Colors.orange,
              ),
            );
          }
          // Continue without location
        }
      }

      // Get current location if service enabled and permission granted
      if (serviceEnabled && permissionGranted == PermissionStatus.granted) {
        LocationData locationData = await location.getLocation();
        userLat = locationData.latitude;
        userLng = locationData.longitude;
        print('User location: $userLat, $userLng');
      }
    } catch (e) {
      print('Error getting location: $e');
      // Continue without location
    }

    // Show day selection dialog
    if (mounted) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Select Day to View Route'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: totalDays,
              itemBuilder: (context, index) {
                final dayNumber = index + 1;
                return ListTile(
                  leading: Icon(
                    Icons.calendar_today,
                    color: DertamColors.primaryDark,
                  ),
                  title: Text('Day $dayNumber'),
                  onTap: () {
                    Navigator.pop(context); // Close dialog
                    // Navigate to map with selected day and user location
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => RouteMapPage(
                          tripId: int.parse(tripId),
                          dayNumber: dayNumber,
                          startLatitude: userLat,
                          startLongitude: userLng,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        ),
      );
    }
  }

  void _shareTrip() async {
    final tripProvider = context.read<TripProvider>();
    final tripDetailState = tripProvider.getTripDetail;
    final tripId = tripDetailState.data?.data.tripId?.toString() ?? '';
    if (tripId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip ID not found'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(color: DertamColors.primaryDark),
            SizedBox(width: 16),
            Text('Generating share link...'),
          ],
        ),
      ),
    );
    try {
      final shareResponse = await tripProvider.generateShareableLink(tripId);
      // Close loading dialog
      if (mounted) Navigator.pop(context);
      if (shareResponse.success && shareResponse.data != null) {
        final shareLink = shareResponse.data!.shareLink;
        final token = shareResponse.data!.token;
        final expiresAt = shareResponse.data!.expiresAt;
        // Show share dialog with link
        if (mounted) {
          _showShareDialog(shareLink, token, expiresAt);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(shareResponse.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.pop(context);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate share link: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showShareDialog(String shareLink, String token, DateTime expiresAt) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.share, color: DertamColors.primaryDark),
            SizedBox(width: 8),
            Text('Share Trip'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Invitation Code Section
            Text(
              'Invitation Code:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: DertamColors.primaryDark.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: DertamColors.primaryDark.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: SelectableText(
                      token,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: DertamColors.primaryDark,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.copy,
                      size: 20,
                      color: DertamColors.primaryDark,
                    ),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: token));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Invitation code copied!'),
                          backgroundColor: DertamColors.primaryDark,
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    tooltip: 'Copy code',
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            // Instructions
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 18, color: Colors.blue[700]),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Share this code with friends. They can join by tapping the "Join Trip" button in the My Trips screen.',
                      style: TextStyle(fontSize: 12, color: Colors.blue[700]),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 12),
            Text(
              'Expires: ${_formatExpiryDate(expiresAt)}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.pop(context);
              await Share.share(
                'Join my trip on Dertam! 🌍✈️\n\nInvitation Code: $token\n\nOpen the Dertam app → My Trips → Tap "Join Trip" button → Enter the code above',
                subject: 'Dertam Trip Invitation',
              );
            },
            icon: Icon(Icons.share, size: 18),
            label: Text('Share'),
            style: ElevatedButton.styleFrom(
              backgroundColor: DertamColors.primaryDark,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  String _formatExpiryDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}, ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _formatDateRange(DateTime startDate, DateTime endDate) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${startDate.day} ${months[startDate.month - 1]} - ${endDate.day} ${months[endDate.month - 1]} ${endDate.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TripProvider>(
      builder: (context, tripProvider, child) {
        final tripDetailState = tripProvider.getTripDetail;
        // Show loading state
        if (tripDetailState.state == AsyncValueState.loading) {
          return Scaffold(
            backgroundColor: DertamColors.white,
            appBar: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_rounded,
                  color: DertamColors.primaryBlue,
                ),
                onPressed: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => DertamTripScreen()),
                ),
              ),
            ),
            body: Center(
              child: CircularProgressIndicator(color: DertamColors.primaryDark),
            ),
          );
        }

        // Show error state
        if (tripDetailState.state == AsyncValueState.error) {
          return Scaffold(
            backgroundColor: DertamColors.white,
            appBar: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_rounded,
                  color: DertamColors.primaryBlue,
                ),
                onPressed: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => DertamTripScreen()),
                ),
              ),
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Text(
                    'Failed to load trip details',
                    style: DertamTextStyles.heading,
                  ),
                  SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () =>
                        tripProvider.fetchTripDetail(widget.tripId),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DertamColors.primaryDark,
                    ),
                    child: Text('Retry', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          );
        }

        // Get trip data
        final tripData = tripDetailState.data?.data;
        if (tripData == null) {
          return Scaffold(
            backgroundColor: DertamColors.white,
            body: Center(child: Text('No trip data available')),
          );
        }

        final tripName = tripData.tripName ?? 'Trip';
        final getUserJoinTrip = tripData.userAccessType?.totalUserJoin ?? 0;
        final tripId = tripData.tripId ?? '';
        final startDate = tripData.startDate ?? DateTime.now();
        final endDate = tripData.endDate ?? DateTime.now();
        final accessType = tripData.accessType;
        final isOwner = accessType == 'owned';

        // Get days from API response and sort them
        final daysData = tripData.days ?? {};
        final sortedDays = daysData.entries.toList()
          ..sort((a, b) {
            final dayNumA = int.tryParse(a.key.replaceAll('day_', '')) ?? 0;
            final dayNumB = int.tryParse(b.key.replaceAll('day_', '')) ?? 0;
            return dayNumA.compareTo(dayNumB);
          });

        return Scaffold(
          backgroundColor: DertamColors.white,
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 200,
                floating: false,
                pinned: false, // Changed to false so banner scrolls away
                backgroundColor: Colors.transparent,
                elevation: 0,
                leading: Container(
                  margin: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: DertamColors.primaryBlue.withOpacity(0.1),
                        blurRadius: 4,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: Icon(
                      Icons.arrow_back_ios_rounded,
                      color: DertamColors.primaryBlue,
                    ),
                    onPressed: () => Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DertamTripScreen(),
                      ),
                    ),
                    padding: EdgeInsets.zero,
                  ),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: SizedBox(
                    child: Stack(
                      children: [
                        // Background Image
                        Image.asset(
                          'assets/images/poster.jpg',
                          fit: BoxFit.cover,
                          height: 250,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Color(0xFF87CEEB),
                                    Color(0xFFE0F6FF),
                                  ],
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  "LET'S EXPLORE\nTHE WORLD!",
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Sticky Trip Info Section - KEEPING ORIGINAL FONT SIZES
              SliverPersistentHeader(
                pinned: true, // This makes it stick
                delegate: _StickyHeaderDelegate(
                  minHeight: 100, // Increased to fix overflow
                  maxHeight: 100,
                  child: Container(
                    decoration: BoxDecoration(
                      color: DertamColors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    padding: EdgeInsets.symmetric(
                      horizontal: DertamSpacings.l,
                      vertical: DertamSpacings.s,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                tripName,
                                style: DertamTextStyles.heading.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 22, // Slightly reduced from 24
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: 2), // Reduced spacing
                              Text(
                                _formatDateRange(startDate, endDate),
                                style: DertamTextStyles.bodySmall.copyWith(
                                  color: Colors.grey[600],
                                  fontSize:
                                      12, // Slightly smaller to save space
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 12),
                        Text(
                          '$getUserJoinTrip Joined',
                          style: TextStyle(
                            color: DertamColors.primaryDark,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(width: 12),

                        if (isOwner)
                          GestureDetector(
                            onTap: _shareTrip,
                            child: Container(
                              height: 40,
                              padding: EdgeInsets.symmetric(
                                horizontal: 14, // Slightly reduced
                                vertical: 6, // Reduced padding
                              ),
                              decoration: BoxDecoration(
                                color: DertamColors.primaryDark,
                                borderRadius: BorderRadius.circular(
                                  18,
                                ), // Slightly smaller
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.share,
                                    color: DertamColors.white,
                                    size: 15,
                                  ), // Slightly smaller
                                  SizedBox(width: 4),
                                  Text(
                                    'Share',
                                    style: TextStyle(
                                      color: DertamColors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        if (!isOwner)
                          Container(
                            height: 40,
                            padding: EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.visibility,
                                  color: Colors.grey[600],
                                  size: 15,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'View Only',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),

              // Trip Days List
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final dayEntry = sortedDays[index];
                  final dayData = dayEntry.value;
                  final dayNumber = dayData.dayNumber ?? (index + 1);
                  final dayDate =
                      dayData.date ?? startDate.add(Duration(days: index));
                  final placesForDay = dayData.places ?? [];
                  return TripDayCard(
                    dayNumber: dayNumber,
                    date: dayDate,
                    places: placesForDay,
                  );
                }, childCount: sortedDays.length),
              ),

              // Bottom spacing
              SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
          // Floating Action Buttons - Only show for owners
          floatingActionButton: isOwner
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Budget button
                    FloatingActionButton(
                      heroTag: "budget",
                      onPressed: () => _openBudget(context),
                      backgroundColor: Colors.white,
                      child: Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: DertamColors.primaryDark,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Icon(
                          Icons.account_balance_wallet,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                    SizedBox(height: 10),

                    FloatingActionButton(
                      heroTag: "map",
                      onPressed: () =>
                          _navigateToMap(sortedDays.length, tripId.toString()),
                      backgroundColor: DertamColors.white,
                      child: Icon(
                        Icons.map,
                        color: DertamColors.primaryDark,
                        size: 24,
                      ),
                    ),
                    SizedBox(height: 10),

                    // Add more places button
                    FloatingActionButton(
                      heroTag: "add",
                      onPressed: () {
                        // Collect existing places from all days
                        final existingPlaces = <Map<String, dynamic>>[];
                        for (var dayEntry in sortedDays) {
                          final dayData = dayEntry.value;
                          final dayDate =
                              dayData.date ??
                              startDate.add(
                                Duration(
                                  days:
                                      int.parse(
                                        dayEntry.key.replaceAll('day_', ''),
                                      ) -
                                      1,
                                ),
                              );
                          final placesForDay = dayData.places ?? [];

                          for (var place in placesForDay) {
                            existingPlaces.add({
                              'place': place,
                              'selectedDate': dayDate,
                              'addedAt': DateTime.now(),
                            });
                          }
                        }
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ReviewTripScreen(
                              tripId: tripId.toString(),
                              tripName: tripName,
                              startDate: startDate,
                              endDate: endDate,
                              addedPlaces: existingPlaces,
                            ),
                          ),
                        ).then((result) {
                          if (result != null) {
                            tripProvider.fetchTripDetail(widget.tripId);
                          }
                        });
                      },
                      backgroundColor: DertamColors.white,
                      child: Text(
                        'Edit',
                        style: TextStyle(
                          color: DertamColors.primaryDark,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    SizedBox(height: 10),
                  ],
                )
              : null,
        );
      },
    );
  }
}

// Trip Day Card Widget
class TripDayCard extends StatelessWidget {
  final int dayNumber;
  final DateTime date;
  final List<Place> places;

  const TripDayCard({
    super.key,
    required this.dayNumber,
    required this.date,
    required this.places,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(
        horizontal: DertamSpacings.l,
        vertical: DertamSpacings.s,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Day $dayNumber: ${_formatDate(date)}',
            style: DertamTextStyles.subtitle.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          SizedBox(height: DertamSpacings.m),
          // Places list
          if (places.isEmpty)
            Container(
              padding: EdgeInsets.all(DertamSpacings.m),
              child: Center(
                child: Text(
                  'No activities planned for this day',
                  style: DertamTextStyles.body.copyWith(
                    color: Colors.grey[600],
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            )
          else
            ...places.map((place) {
              return TripPlaceCard(
                place: place,
                enableSwipeToDelete: false,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        DetailEachPlace(placeId: place.placeId),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    const weekdays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}';
  }
}

// SliverPersistentHeaderDelegate for sticky header
class _StickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  _StickyHeaderDelegate({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return SizedBox.expand(child: child);
  }

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return maxHeight != oldDelegate.maxExtent ||
        minHeight != oldDelegate.minExtent ||
        child != (oldDelegate as _StickyHeaderDelegate).child;
  }
}
