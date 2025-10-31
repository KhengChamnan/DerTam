import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamSearchRoomResult extends StatelessWidget {
  final String hotel;
  final DateTime checkInDate;
  final DateTime checkOutDate;
  final int guestCount;
  final List<Room>? availableRooms;

  const DertamSearchRoomResult({
    super.key,
    required this.hotel,
    required this.checkInDate,
    required this.checkOutDate,
    required this.guestCount,
    this.availableRooms,
  });

  String _formatDate(DateTime date) {
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
    return '${date.day.toString().padLeft(2, '0')}-${months[date.month - 1]}-${date.year}';
  }

  int get numberOfNights => checkOutDate.difference(checkInDate).inDays;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Container(
              padding: const EdgeInsets.all(DertamSpacings.m),
              decoration: BoxDecoration(
                color: DertamColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    spreadRadius: 0,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Back button and Hotel info
                  Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: DertamColors.white,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.grey[300]!,
                            width: 1,
                          ),
                        ),
                        child: IconButton(
                          icon: Icon(
                            Icons.arrow_back_ios_new,
                            color: DertamColors.primaryDark,
                            size: 20,
                          ),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ),
                      const SizedBox(width: DertamSpacings.m),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              hotel,
                              style: DertamTextStyles.subtitle.copyWith(
                                color: DertamColors.primaryDark,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_formatDate(checkInDate)} - ${_formatDate(checkOutDate)}  •  $guestCount guests',
                              style: DertamTextStyles.bodySmall.copyWith(
                                color: Colors.grey[600],
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Room List
            Expanded(
              child: availableRooms!.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Iconsax.search_normal_1,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: DertamSpacings.m),
                          Text(
                            'No rooms available',
                            style: DertamTextStyles.subtitle.copyWith(
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: DertamSpacings.xs),
                          Text(
                            'Try adjusting your search criteria',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(DertamSpacings.m),
                      itemCount: availableRooms!.length,
                      itemBuilder: (context, index) {
                        return _RoomResultCard(
                          room: availableRooms![index],
                          numberOfNights: numberOfNights,
                          onBookNow: () {
                            // Handle booking action
                            _handleBooking(context, availableRooms![index]);
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleBooking(BuildContext context, Room room) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Booking ${room.roomType}...'),
        backgroundColor: DertamColors.primaryDark,
      ),
    );
  }
}

class _RoomResultCard extends StatefulWidget {
  final Room room;
  final int numberOfNights;
  final VoidCallback onBookNow;

  const _RoomResultCard({
    required this.room,
    required this.numberOfNights,
    required this.onBookNow,
  });

  @override
  State<_RoomResultCard> createState() => _RoomResultCardState();
}

class _RoomResultCardState extends State<_RoomResultCard> {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: DertamSpacings.m),
      decoration: BoxDecoration(
        color: DertamColors.white,
        borderRadius: BorderRadius.circular(DertamSpacings.radius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            spreadRadius: 0,
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Room Image with Favorite Button
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(DertamSpacings.radius),
                  topRight: Radius.circular(DertamSpacings.radius),
                ),
                child: widget.room.imagesUrl.isEmpty
                    ? Container(
                        width: double.infinity,
                        height: 200,
                        color: Colors.grey[300],
                        child: Icon(
                          Iconsax.gallery,
                          size: 48,
                          color: Colors.grey[500],
                        ),
                      )
                    : Image.network(
                        widget.room.imagesUrl.first,
                        width: double.infinity,
                        height: 200,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: double.infinity,
                            height: 200,
                            color: Colors.grey[300],
                            child: Icon(
                              Iconsax.gallery_slash,
                              size: 48,
                              color: Colors.grey[500],
                            ),
                          );
                        },
                      ),
              ),

              Positioned(
                bottom: DertamSpacings.s,
                right: DertamSpacings.s,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        spreadRadius: 0,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '4.95', // Replace with actual rating
                        style: DertamTextStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        ' (672 reviews)', // Replace with actual review count
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.grey[600],
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Room Details
          Padding(
            padding: const EdgeInsets.all(DertamSpacings.m),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Room Name
                Text(
                  widget.room.roomType,
                  style: DertamTextStyles.subtitle.copyWith(
                    color: DertamColors.primaryDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: DertamSpacings.xs),
                // Capacity and Duration
                Text(
                  '${widget.numberOfNights} days ${widget.numberOfNights + 1} nights - ${widget.room.maxGuests}',
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: Colors.grey[600],
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: DertamSpacings.m),

                // Book Now Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: widget.onBookNow,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DertamColors.primaryDark,
                      foregroundColor: DertamColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          DertamSpacings.buttonRadius,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(
                        vertical: DertamSpacings.s,
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Book Now',
                      style: DertamTextStyles.button.copyWith(
                        color: DertamColors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
