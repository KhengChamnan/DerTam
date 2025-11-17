import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/hotel/search_room.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_booking_room_screen.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_confirm_booking.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DertamSearchRoomResult extends StatelessWidget {
  const DertamSearchRoomResult({super.key});

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final searchRoomsData = hotelProvider.searchAvailableRooms;

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
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: DertamColors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.grey[300]!, width: 1),
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
                          'Available Rooms',
                          style: DertamTextStyles.subtitle.copyWith(
                            color: DertamColors.primaryDark,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (searchRoomsData.data != null &&
                            searchRoomsData.data!.rooms.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            '${searchRoomsData.data!.rooms.length} room(s) found',
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Room List
            Expanded(
              child: Builder(
                builder: (context) {
                  // Loading state
                  if (searchRoomsData.state == AsyncValueState.loading) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('Searching for available rooms...'),
                        ],
                      ),
                    );
                  }

                  // Error state
                  if (searchRoomsData.state == AsyncValueState.error) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Failed to search rooms',
                              style: DertamTextStyles.title,
                            ),
                            SizedBox(height: 8),
                            Text(
                              '${searchRoomsData.error}',
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: () => Navigator.pop(context),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: DertamColors.primaryDark,
                              ),
                              child: const Text('Go Back'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Empty or no data
                  if (searchRoomsData.data == null ||
                      searchRoomsData.data!.rooms.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Iconsax.search_normal_1,
                            size: 64,
                            color: Colors.grey,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'No rooms available',
                            style: DertamTextStyles.subtitle,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Try adjusting your search criteria',
                            style: DertamTextStyles.bodyMedium,
                          ),
                          SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: () => Navigator.pop(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DertamColors.primaryDark,
                            ),
                            child: const Text('Go Back'),
                          ),
                        ],
                      ),
                    );
                  }

                  // Success state
                  return ListView.builder(
                    padding: const EdgeInsets.all(DertamSpacings.m),
                    itemCount: searchRoomsData.data!.rooms.length,
                    itemBuilder: (context, index) {
                      final room = searchRoomsData.data!.rooms[index];
                      return _RoomResultCard(
                        room: room,
                        onBookNow: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DertamConfirmBooking(
                              roomType: room.roomType,
                              pricePerNight: room.pricePerNight,
                              roomImage: room.imagesUrl,
                              maxGuests: room.maxGuests,
                              checkIn:
                                  searchRoomsData.data?.searchParams.checkIn,
                              checkOut:
                                  searchRoomsData.data?.searchParams.checkOut,
                              room: room.toRoom(),
                            ),
                          ),
                        ),
                        ontap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DertamBookingRoomScreen(
                              roomId: room.roomPropertiesId,
                              checkIn:
                                  searchRoomsData.data?.searchParams.checkIn,
                              checkOut:
                                  searchRoomsData.data?.searchParams.checkOut,
                            ),
                          ),
                        ),
                      );
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
}

class _RoomResultCard extends StatefulWidget {
  final SearchRoomResult room;
  final VoidCallback onBookNow;
  final VoidCallback ontap;

  const _RoomResultCard({
    required this.room,
    required this.onBookNow,
    required this.ontap,
  });

  @override
  State<_RoomResultCard> createState() => _RoomResultCardState();
}

class _RoomResultCardState extends State<_RoomResultCard> {
  String _formatPrice(double price) {
    return '\$${price.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.ontap,
      child: Container(
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
            // Room Image
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
                          height: 250,
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
                // Available rooms badge
                Positioned(
                  top: DertamSpacings.s,
                  left: DertamSpacings.s,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: DertamColors.primaryDark,
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
                    child: Text(
                      '${widget.room.availableRoomsCount} rooms left',
                      style: DertamTextStyles.bodySmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
                // Hotel rating badge
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
                          widget.room.property.place.ratings.toStringAsFixed(1),
                          style: DertamTextStyles.bodySmall.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
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
                  // Hotel Name
                  Text(
                    widget.room.property.place.name,
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.grey[600],
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Room Type
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
                  // Room Details
                  Row(
                    children: [
                      Icon(
                        Iconsax.profile_2user,
                        size: 16,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.room.maxGuests} guests',
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Iconsax.size, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.room.roomSize} m²',
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.bed, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.room.numberOfBed} bed',
                        style: DertamTextStyles.bodySmall.copyWith(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.s),
                  // Amenities
                  if (widget.room.amenities.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: widget.room.amenities.take(3).map((amenity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: DertamColors.backgroundWhite,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.grey[300]!,
                              width: 1,
                            ),
                          ),
                          child: Text(
                            amenity.amenityName,
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: Colors.grey[700],
                              fontSize: 11,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: DertamSpacings.s),
                  ],
                  // Price and Duration
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total for ${widget.room.nights} night(s)',
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: Colors.grey[600],
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                _formatPrice(widget.room.totalPrice),
                                style: DertamTextStyles.title.copyWith(
                                  color: DertamColors.primaryDark,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Text(
                                  '${_formatPrice(widget.room.pricePerNight)}/night',
                                  style: DertamTextStyles.bodySmall.copyWith(
                                    color: Colors.grey[500],
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      SizedBox(
                        width: 120,
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
                            'Reservation',
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
