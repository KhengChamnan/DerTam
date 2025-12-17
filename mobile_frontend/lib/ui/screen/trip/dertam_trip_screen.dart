import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/trips/trips.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_detail_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_trip_planning_screen.dart';
import 'package:mobile_frontend/ui/screen/trip/widgets/dertam_join_trip_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class DertamTripScreen extends StatefulWidget {
  const DertamTripScreen({super.key});

  @override
  State<DertamTripScreen> createState() => _DertamTripScreenState();
}

class _DertamTripScreenState extends State<DertamTripScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<TripProvider>().fetchAllTrip();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<Trip> _filterUpcomingTrips(List<Trip> trips) {
    final now = DateTime.now();
    return trips
        .where(
          (trip) =>
              trip.endDate.isAfter(now) || trip.endDate.isAtSameMomentAs(now),
        )
        .toList()
      ..sort((a, b) => a.startDate.compareTo(b.startDate));
  }

  List<Trip> _filterPastTrips(List<Trip> trips) {
    final now = DateTime.now();
    return trips.where((trip) => trip.endDate.isBefore(now)).toList()
      ..sort((a, b) => b.endDate.compareTo(a.endDate));
  }

  String _getTripStatus(Trip trip) {
    final now = DateTime.now();
    if (now.isAfter(trip.startDate) && now.isBefore(trip.endDate)) {
      return 'Ongoing';
    } else if (now.isBefore(trip.startDate)) {
      return 'Upcoming';
    } else {
      return 'Completed';
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Ongoing':
        return Colors.green;
      case 'Upcoming':
        return Colors.blue;
      case 'Completed':
        return Colors.green.shade600;
      default:
        return Colors.grey;
    }
  }

  int _getDaysLeft(Trip trip) {
    final now = DateTime.now();
    if (now.isAfter(trip.endDate)) {
      return 0;
    }
    return trip.endDate.difference(now).inDays;
  }

  int _getDaysEnded(Trip trip) {
    final now = DateTime.now();
    return now.difference(trip.endDate).inDays;
  }

  void _showJoinTripDialog() {
    final TextEditingController codeController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.group_add, color: DertamColors.primaryBlue),
            SizedBox(width: 8),
            Text('Join a Trip'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter the invitation code shared with you:',
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            SizedBox(height: 16),
            TextField(
              controller: codeController,
              decoration: InputDecoration(
                hintText: 'e.g., RcQ29ALUpJXNC...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: Icon(Icons.vpn_key),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'The code is the last part of the shared link',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final code = codeController.text.trim();
              if (code.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Please enter an invitation code'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => JoinTripScreen(shareToken: code),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DertamColors.primaryBlue,
              foregroundColor: Colors.white,
            ),
            child: Text('Join Trip'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        automaticallyImplyLeading: false,
        elevation: 0,
        title: Text(
          'My Trips',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: DertamColors.primaryBlue,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TabBar(
              controller: _tabController,
              labelColor: DertamColors.primaryBlue,
              unselectedLabelColor: DertamColors.neutralLight,
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.normal,
              ),
              indicatorColor: DertamColors.primaryBlue,
              indicatorWeight: 3,
              tabs: const [
                Tab(text: 'Upcoming'),
                Tab(text: 'Past'),
              ],
            ),
          ),
        ),
      ),
      body: Consumer<TripProvider>(
        builder: (context, tripProvider, child) {
          return tripProvider.getTripList.when(
            empty: () => const Center(child: Text('No trips yet')),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.wifi_off_rounded,
                        size: 64,
                        color: Colors.red.shade400,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Oops! Something went wrong',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: DertamColors.black,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'We couldn\'t load your trips right now.\nPlease check your connection and try again.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: () => tripProvider.fetchAllTrip(),
                      icon: const Icon(Icons.refresh, color: Colors.white),
                      label: const Text(
                        'Try Again',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: DertamColors.primaryBlue,
                        foregroundColor: DertamColors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 16,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            success: (trips) {
              final upcomingTrips = _filterUpcomingTrips(trips);
              final pastTrips = _filterPastTrips(trips);
              return TabBarView(
                controller: _tabController,
                children: [
                  // Upcoming Trips Tab
                  upcomingTrips.isEmpty
                      ? RefreshIndicator(
                          onRefresh: () => tripProvider.fetchAllTrip(),
                          child: ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: const [
                              SizedBox(height: 200),
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.card_travel,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'No upcoming trips',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: () => tripProvider.fetchAllTrip(),
                          child: ListView.builder(
                            padding: const EdgeInsets.all(8),
                            itemCount: upcomingTrips.length,
                            itemBuilder: (context, index) {
                              return TripCard(
                                trip: upcomingTrips[index],
                                status: _getTripStatus(upcomingTrips[index]),
                                statusColor: _getStatusColor(
                                  _getTripStatus(upcomingTrips[index]),
                                ),
                                daysInfo:
                                    '${_getDaysLeft(upcomingTrips[index])} days left',
                                onDetailTrip: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => TripDetailScreen(
                                      tripId: upcomingTrips[index].tripId
                                          .toString(),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                  // Past Trips Tab
                  pastTrips.isEmpty
                      ? RefreshIndicator(
                          onRefresh: () => tripProvider.fetchAllTrip(),
                          child: ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: const [
                              SizedBox(height: 200),
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.history,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'No past trips',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: () => tripProvider.fetchAllTrip(),
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: pastTrips.length,
                            itemBuilder: (context, index) {
                              return TripCard(
                                trip: pastTrips[index],
                                status: 'Completed',
                                statusColor: Colors.green.shade600,
                                daysInfo:
                                    'Ended ${_getDaysEnded(pastTrips[index])} days ago',
                                onDetailTrip: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => TripDetailScreen(
                                      tripId: pastTrips[index].tripId
                                          .toString(),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                ],
              );
            },
          );
        },
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'create_trip',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TripPlanning()),
              );
            },
            backgroundColor: DertamColors.white,
            shape: const CircleBorder(),
            elevation: 4,
            child: Text(
              'Add',
              style: TextStyle(
                color: DertamColors.primaryDark,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          SizedBox(height: 12),

          // Join Trip Button
          FloatingActionButton(
            heroTag: 'join_trip',
            onPressed: _showJoinTripDialog,
            backgroundColor: DertamColors.white,
            shape: const CircleBorder(),
            elevation: 4,
            child: Icon(
              Icons.group_add,
              color: DertamColors.primaryBlue,
              size: 28,
            ),
          ),

          // Create Trip Button
        ],
      ),
      bottomNavigationBar: const Navigationbar(currentIndex: 2),
    );
  }
}

class TripCard extends StatelessWidget {
  final Trip trip;
  final String status;
  final Color statusColor;
  final String daysInfo;
  final VoidCallback? onDetailTrip;

  const TripCard({
    super.key,
    required this.trip,
    required this.status,
    required this.statusColor,
    required this.daysInfo,
    this.onDetailTrip,
  });

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onDetailTrip,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: DertamColors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Trip Image with Status Badge - Reduced height
              Stack(
                children: [
                  Container(
                    height: 140,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: trip.coverImage!.isNotEmpty
                            ? NetworkImage(trip.coverImage ?? '')
                            : AssetImage('assets/images/dertam_logo.png')
                                  as ImageProvider,
                        fit: BoxFit.cover,
                        colorFilter: ColorFilter.mode(
                          DertamColors.black.withOpacity(0.15),
                          BlendMode.darken,
                        ),
                      ),
                      color: Colors.grey.shade300,
                    ),
                  ),
                  // Gradient overlay for better text readability
                  Container(
                    height: 140,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          DertamColors.primaryBlue.withOpacity(0.3),
                          DertamColors.black.withOpacity(0.3),
                        ],
                      ),
                    ),
                  ),
                  // Status Badge - Smaller and more modern
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: statusColor.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          color: DertamColors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              // Trip Details - Reduced padding
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      trip.tripName,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: DertamColors.primaryBlue,
                        letterSpacing: 1.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today_outlined,
                          size: 14,
                          color: Colors.grey.shade600,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '${_formatDate(trip.startDate)} - ${_formatDate(trip.endDate)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.timelapse_sharp,
                              size: 14,
                              color: Colors.grey.shade600,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '${trip.dayCount ?? 0} days',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: status == 'Completed'
                                ? Colors.grey.shade100
                                : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            daysInfo,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: status == 'Completed'
                                  ? Colors.grey.shade700
                                  : Colors.green.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
