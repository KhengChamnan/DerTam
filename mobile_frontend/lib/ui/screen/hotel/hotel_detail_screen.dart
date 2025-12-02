import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_booking_room_screen.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_room_card.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_search_room_result.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_select_date.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_hotel_facility.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class HotelDetailScreen extends StatefulWidget {
  final String hotelId;
  const HotelDetailScreen({super.key, required this.hotelId});
  @override
  State<HotelDetailScreen> createState() => _HotelDetailScreenState();
}

class _HotelDetailScreenState extends State<HotelDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hotelProvider = context.read<HotelProvider>();
      hotelProvider.fetchHotelDetail(widget.hotelId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final hotelDetailData = hotelProvider.hotelDetail;
    // Handle loading state
    if (hotelDetailData.state == AsyncValueState.loading) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        appBar: AppBar(
          backgroundColor: DertamColors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_new,
              color: DertamColors.primaryDark,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: const Text('Loading...'),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Fetching hotel details...'),
            ],
          ),
        ),
      );
    }

    // Handle error state
    if (hotelDetailData.state == AsyncValueState.error) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        appBar: AppBar(
          backgroundColor: DertamColors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_new,
              color: DertamColors.primaryDark,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                const SizedBox(height: 16),
                Text(
                  'Failed to load hotel details',
                  style: DertamTextStyles.title.copyWith(
                    color: DertamColors.primaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${hotelDetailData.error}',
                  style: DertamTextStyles.body.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    context.read<HotelProvider>().fetchHotelDetail(
                      widget.hotelId,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DertamColors.primaryDark,
                  ),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Handle empty/null data
    if (hotelDetailData.data == null) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        appBar: AppBar(
          backgroundColor: DertamColors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_new,
              color: DertamColors.primaryDark,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.hotel_outlined, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No hotel data available',
                style: DertamTextStyles.title.copyWith(
                  color: DertamColors.primaryDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'State: ${hotelDetailData.state}',
                style: DertamTextStyles.body.copyWith(color: Colors.grey[600]),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  context.read<HotelProvider>().fetchHotelDetail(
                    widget.hotelId,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: DertamColors.primaryDark,
                ),
                child: const Text('Reload'),
              ),
            ],
          ),
        ),
      );
    }

    // Success state - show the actual content
    final hotel = hotelDetailData.data!;

    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
          // App Bar with image
          SliverAppBar(
            expandedHeight: 250,
            pinned: false,
            floating: false,

            backgroundColor: DertamColors.white,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      spreadRadius: 0,
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
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
            ),
            
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  hotel.place.imagesUrl.isNotEmpty
                      ? Image.network(
                          hotel.place.imagesUrl.first,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: Colors.grey[300],
                              child: Center(
                                child: CircularProgressIndicator(
                                  value:
                                      loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                      : null,
                                ),
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: Icon(
                                Icons.broken_image_outlined,
                                size: 80,
                                color: Colors.grey[500],
                              ),
                            );
                          },
                        )
                      : Container(
                          color: Colors.grey[300],
                          child: Icon(
                            Icons.hotel_outlined,
                            size: 80,
                            color: Colors.grey[500],
                          ),
                        ),
                  // Route button overlay
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            spreadRadius: 0,
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Iconsax.routing_2,
                            size: 18,
                            color: DertamColors.primaryDark,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Route',
                            style: DertamTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              color: DertamColors.primaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(DertamSpacings.m),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hotel name and rating
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          hotel.place.name,
                          style: DertamTextStyles.title.copyWith(
                            color: DertamColors.primaryDark,
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                          ),
                        ),
                      ),
                      // Star rating
                      ...List.generate(
                        5,
                        (index) => Icon(
                          index < (hotel.place.rating).floor()
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        hotel.place.rating.toStringAsFixed(1),
                        style: DertamTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: DertamSpacings.s),
                  // Location
                  Row(
                    children: [
                      Icon(
                        Iconsax.location,
                        size: 16,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          hotel.place.provinceCategory.provinceCategoryName??'No Province Found!',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.l),
                  // Facilities section
                  if (hotel.facilities.isNotEmpty) ...[
                    Text(
                      'Facilities',
                      style: DertamTextStyles.title.copyWith(
                        color: DertamColors.primaryDark,
                        fontWeight: FontWeight.bold,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: DertamSpacings.s),
                    SizedBox(
                      height: 96,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: hotel.facilities.length,
                        itemBuilder: (context, index) {
                          final facility = hotel.facilities[index];
                          return Padding(
                            padding: EdgeInsets.only(
                              right: index < hotel.facilities.length - 1
                                  ? DertamSpacings.s
                                  : 0,
                            ),
                            child: FacilitiesList(imageUrl: facility.imageUrl),
                          );
                        },
                      ),
                    ),
                  ] else ...[
                    Text(
                      'No facilities information available',
                      style: DertamTextStyles.bodyMedium.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          // Room section
          if (hotel.roomProperties.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: DertamSpacings.m,
                ),
                child: Text(
                  'Available Rooms',
                  style: DertamTextStyles.title.copyWith(
                    color: DertamColors.primaryDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: DertamSpacings.m)),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final room = hotel.roomProperties[index];
                  return DertamRoomCard(
                    room: room,
                    onCheckAvailability: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DertamBookingRoomScreen(
                          roomId: room.roomPropertiesId,
                        ),
                      ),
                    ),
                    onAddToCart: () {
                      // TODO: Implement cart functionality with provider
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '${room.roomType} added to cart!',
                            style: const TextStyle(color: Colors.white),
                          ),
                          backgroundColor: DertamColors.primaryBlue,
                          duration: const Duration(seconds: 2),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      );
                    },
                  );
                }, childCount: hotel.roomProperties.length),
              ),
            ),
          ] else ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(DertamSpacings.m),
                child: Center(
                  child: Text(
                    'No rooms available',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(DertamSpacings.m),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: DertamColors.primaryDark,
            padding: const EdgeInsets.symmetric(vertical: DertamSpacings.m),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(DertamSpacings.radiusSmall),
            ),
          ),
          onPressed: () async {
            final result = await DertamSelectDate.show(context);
            if (result != null) {
              final DateTime checkInDate = result['checkInDate'] as DateTime;
              final DateTime checkOutDate = result['checkOutDate'] as DateTime;
              final int guestCount = result['guestCount'] as int;
              final int numberOfNights = result['numberOfNights'] as int;

              print(
                'Searching for $guestCount guests\n'
                'Check-in: $checkInDate\n'
                'Check-out: $checkOutDate\n'
                'Nights: $numberOfNights',
              );

              try {
                final searchResults = await hotelProvider.searchAvailableRoom(
                  checkInDate,
                  checkOutDate,
                  guestCount,
                  numberOfNights,
                );

                if (mounted && searchResults.rooms.isNotEmpty) {
                  // Navigate to search results screen
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DertamSearchRoomResult(),
                    ),
                  );
                } else if (mounted) {
                  // Show no results message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text(
                        'No available rooms found for the selected dates',
                        style: TextStyle(color: Colors.white),
                      ),
                      backgroundColor: Colors.orange,
                      duration: const Duration(seconds: 3),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Failed to search rooms: ${e.toString()}',
                        style: const TextStyle(color: Colors.white),
                      ),
                      backgroundColor: Colors.red,
                      duration: const Duration(seconds: 3),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  );
                }
              }
            }
          },
          child: Text(
            'Search rooms',
            style: DertamTextStyles.button.copyWith(
              color: DertamColors.white,
              fontWeight: FontWeight.normal,
              fontSize: 18,
            ),
          ),
        ),
      ),
    );
  }
}
