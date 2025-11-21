import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/screen/budget/select_currency_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_add_place_to_trip.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_place_card.dart';
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

  void _openBudget(BuildContext context) {
    final tripProvider = context.read<TripProvider>().getTripDetail;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SetBudgetScreen(
          tripId: tripProvider.data?.data.tripId.toString() ?? '',
          tripName: tripProvider.data?.data.tripName ?? 'Trip not found',
          startDate: tripProvider.data?.data.startDate ?? DateTime.now(),
          endDate: tripProvider.data?.data.endDate ?? DateTime.now(),
        ),
      ),
    ).then((result) {
      // Handle result when returning from budget screen
      if (result != null) {
        // You can update the trip budget state here
        print('Budget set: ${result['totalBudget']} ${result['currency']}');

        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Budget set successfully: ${result['totalBudget']} ${result['currency']}',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  void _openMap() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.map, color: DertamColors.primaryDark),
            SizedBox(width: 8),
            Text('Trip Map'),
          ],
        ),
        content: Text('View all trip locations on the map.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to map screen
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DertamColors.primaryDark,
            ),
            child: Text('Open Map', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _shareTrip() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Share Trip'),
        content: Text('Share functionality will be implemented here.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getMockUsers() {
    return [
      {
        'id': 'current_user',
        'name': 'You',
        'initial': 'Y',
        'color': DertamColors.primaryDark,
        'isCurrentUser': true,
        'imageUrl': null,
      },
      {
        'id': 'user_2',
        'name': 'Alice',
        'initial': 'A',
        'color': Colors.purple[300],
        'isCurrentUser': false,
        'imageUrl': null,
      },
      {
        'id': 'user_3',
        'name': 'Bob',
        'initial': 'B',
        'color': Colors.pink[300],
        'isCurrentUser': false,
        'imageUrl': null,
      },
      {
        'id': 'user_4',
        'name': 'Charlie',
        'initial': 'C',
        'color': Colors.orange[300],
        'isCurrentUser': false,
        'imageUrl': null,
      },
      {
        'id': 'user_5',
        'name': 'Diana',
        'initial': 'D',
        'color': Colors.green[300],
        'isCurrentUser': false,
        'imageUrl': null,
      },
    ];
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
                onPressed: () => Navigator.pop(context),
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
                onPressed: () => Navigator.pop(context),
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
        final startDate = tripData.startDate ?? DateTime.now();
        final endDate = tripData.endDate ?? DateTime.now();

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
                    onPressed: () => Navigator.pop(context),
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
                        Row(
                          children: [
                            // Original Avatar stack
                            AvatarStack(users: _getMockUsers()),
                            SizedBox(width: 8), // Original spacing
                            // Slightly smaller Share button
                            GestureDetector(
                              onTap: _shareTrip,
                              child: Container(
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
                                      color: Colors.white,
                                      size: 15,
                                    ), // Slightly smaller
                                    SizedBox(width: 4),
                                    Text(
                                      'Share',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
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
          // Floating Action Buttons
          floatingActionButton: Column(
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

              // Add more places button
              FloatingActionButton(
                heroTag: "add",
                onPressed: () {
                  // Navigate to SelectPlaceScreen with existing places
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DertamAddPlaceToTrip(),
                    ),
                  ).then((result) {
                    // Refresh trip details after adding places
                    if (result != null) {
                      tripProvider.fetchTripDetail(widget.tripId);
                    }
                  });
                },
                backgroundColor: DertamColors.white,
                child: Icon(
                  Icons.add,
                  color: DertamColors.primaryDark,
                  size: 30,
                ),
              ),
              SizedBox(height: 10),

              // Map button
              FloatingActionButton(
                heroTag: "map",
                onPressed: _openMap,
                backgroundColor: DertamColors.primaryDark,
                child: Icon(Icons.map, color: Colors.white, size: 24),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Avatar Stack Widget - KEEPING ORIGINAL SIZES
class AvatarStack extends StatelessWidget {
  final List<Map<String, dynamic>> users;
  final int maxVisibleAvatars;

  const AvatarStack({
    super.key,
    required this.users,
    this.maxVisibleAvatars = 2, // Default to 2 for mobile
  });

  @override
  Widget build(BuildContext context) {
    final visibleUsers = users.take(maxVisibleAvatars).toList();
    final remainingCount = users.length - maxVisibleAvatars;

    return SizedBox(
      width: _calculateTotalWidth(),
      height: 32, // Original height
      child: Stack(
        children: [
          // Visible avatars
          ...visibleUsers.asMap().entries.map((entry) {
            final index = entry.key;
            final user = entry.value;
            return Positioned(
              left: index * 20.0, // Original overlap
              child: _buildAvatar(
                user: user,
                isCurrentUser: user['isCurrentUser'] ?? false,
              ),
            );
          }),

          // +X indicator for remaining users
          if (remainingCount > 0)
            Positioned(
              left: visibleUsers.length * 20.0,
              child: _buildMoreIndicator(remainingCount),
            ),
        ],
      ),
    );
  }

  double _calculateTotalWidth() {
    final visibleCount = users.length > maxVisibleAvatars
        ? maxVisibleAvatars
        : users.length;
    final baseWidth = visibleCount * 20.0 + 12.0; // Original calculation
    final moreIndicatorWidth = users.length > maxVisibleAvatars ? 32.0 : 0.0;
    return baseWidth + moreIndicatorWidth;
  }

  Widget _buildAvatar({
    required Map<String, dynamic> user,
    required bool isCurrentUser,
  }) {
    return Container(
      width: 32, // Original size
      height: 32, // Original size
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: isCurrentUser ? DertamColors.primaryDark : Colors.white,
          width: isCurrentUser ? 2.5 : 2, // Original border width
        ),
        boxShadow: [
          BoxShadow(
            color: DertamColors.black.withOpacity(0.1),
            blurRadius: 3, // Original blur radius
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: ClipOval(
        child: user['imageUrl'] != null
            ? Image.network(
                user['imageUrl'],
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return _buildFallbackAvatar(user);
                },
              )
            : _buildFallbackAvatar(user),
      ),
    );
  }

  Widget _buildFallbackAvatar(Map<String, dynamic> user) {
    return Container(
      color: user['color'] ?? Colors.blue[300],
      child: Center(
        child: Text(
          user['initial'] ?? user['name']?.substring(0, 1).toUpperCase() ?? 'U',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14, // Original font size
          ),
        ),
      ),
    );
  }

  Widget _buildMoreIndicator(int count) {
    return Container(
      width: 32, // Original size
      height: 32, // Original size
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.grey[400],
        border: Border.all(
          color: Colors.white,
          width: 2,
        ), // Original border width
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3, // Original blur radius
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: Text(
          '+$count',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
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
          // Day header
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
              return TripPlaceCard(place: place, enableSwipeToDelete: false);
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
