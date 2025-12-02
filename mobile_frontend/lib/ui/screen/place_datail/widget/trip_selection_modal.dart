import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/trips/trips.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/trip_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

/// A modal bottom sheet that displays the user's trips for selection
class TripSelectionModal extends StatefulWidget {
  final Function(Trip) onTripSelected;
  final VoidCallback? onCreateNewTrip;
  final VoidCallback onCancel;

  const TripSelectionModal({
    super.key,
    required this.onTripSelected,
    this.onCreateNewTrip,
    required this.onCancel,
  });

  /// Shows the trip selection modal
  static Future<void> show({
    required BuildContext context,
    required Function(Trip) onTripSelected,
    VoidCallback? onCreateNewTrip,
    required VoidCallback onCancel,
  }) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: true,
      enableDrag: true,
      builder: (context) => TripSelectionModal(
        onTripSelected: onTripSelected,
        onCreateNewTrip: onCreateNewTrip,
        onCancel: onCancel,
      ),
    );
  }

  @override
  State<TripSelectionModal> createState() => _TripSelectionModalState();
}

class _TripSelectionModalState extends State<TripSelectionModal> {
  @override
  void initState() {
    super.initState();
    // Fetch trips when modal opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripProvider>().fetchAllTrip();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tripProvider = context.watch<TripProvider>();
    final tripListData = tripProvider.getTripList;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: EdgeInsets.symmetric(vertical: DertamSpacings.s),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: DertamColors.neutralLighter,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: DertamSpacings.l,
              vertical: DertamSpacings.s,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Select a Trip',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: DertamColors.black,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                GestureDetector(
                  onTap: widget.onCancel,
                  child: Container(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.close,
                      color: DertamColors.primaryDark,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Divider(height: 1, color: Colors.grey[300]),

          // Trip list
          Flexible(child: _buildTripList(tripListData)),

          // Create new trip button
          if (widget.onCreateNewTrip != null)
            Padding(
              padding: EdgeInsets.all(DertamSpacings.m),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    widget.onCreateNewTrip?.call();
                  },
                  icon: Icon(Icons.add, color: DertamColors.primaryBlue),
                  label: Text(
                    'Create New Trip',
                    style: TextStyle(
                      color: DertamColors.primaryBlue,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(
                      color: DertamColors.primaryBlue,
                      width: 1.5,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ),

          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  Widget _buildTripList(AsyncValue<List<Trip>> tripListData) {
    switch (tripListData.state) {
      case AsyncValueState.loading:
        return Center(
          child: Padding(
            padding: EdgeInsets.all(DertamSpacings.xl),
            child: CircularProgressIndicator(color: DertamColors.primaryBlue),
          ),
        );

      case AsyncValueState.error:
        return Center(
          child: Padding(
            padding: EdgeInsets.all(DertamSpacings.l),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline, color: Colors.red, size: 48),
                SizedBox(height: DertamSpacings.s),
                Text(
                  'Failed to load trips',
                  style: TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: DertamSpacings.xs),
                Text(
                  tripListData.error.toString(),
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: DertamSpacings.m),
                TextButton.icon(
                  onPressed: () {
                    context.read<TripProvider>().fetchAllTrip();
                  },
                  icon: Icon(Icons.refresh),
                  label: Text('Retry'),
                ),
              ],
            ),
          ),
        );

      case AsyncValueState.empty:
        return _buildEmptyState();

      case AsyncValueState.success:
        final trips = tripListData.data ?? [];
        if (trips.isEmpty) {
          return _buildEmptyState();
        }
        return ListView.separated(
          shrinkWrap: true,
          padding: EdgeInsets.symmetric(
            horizontal: DertamSpacings.m,
            vertical: DertamSpacings.s,
          ),
          itemCount: trips.length,
          separatorBuilder: (context, index) =>
              SizedBox(height: DertamSpacings.s),
          itemBuilder: (context, index) {
            final trip = trips[index];
            return _TripCard(
              trip: trip,
              onTap: () {
                Navigator.pop(context);
                widget.onTripSelected(trip);
              },
            );
          },
        );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(DertamSpacings.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.luggage_outlined, size: 64, color: Colors.grey[400]),
            SizedBox(height: DertamSpacings.m),
            Text(
              'No trips yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: DertamSpacings.xs),
            Text(
              'Create a new trip to start planning!',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;

  const _TripCard({required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM d, yyyy');
    final startDateStr = dateFormat.format(trip.startDate);
    final endDateStr = dateFormat.format(trip.endDate);
    final duration = trip.endDate.difference(trip.startDate).inDays + 1;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.all(DertamSpacings.m),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Row(
          children: [
            // Trip image or placeholder
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: DertamColors.primaryBlue.withOpacity(0.1),
                image: trip.coverImage != null && trip.coverImage!.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(trip.coverImage!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: trip.coverImage == null || trip.coverImage!.isEmpty
                  ? Icon(
                      Icons.map_outlined,
                      color: DertamColors.primaryBlue,
                      size: 28,
                    )
                  : null,
            ),
            SizedBox(width: DertamSpacings.m),

            // Trip info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trip.tripName,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: DertamColors.black,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 14,
                        color: Colors.grey[600],
                      ),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '$startDateStr - $endDateStr',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2),
                  Text(
                    '$duration ${duration == 1 ? 'day' : 'days'}',
                    style: TextStyle(
                      fontSize: 12,
                      color: DertamColors.primaryBlue,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Arrow icon
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
