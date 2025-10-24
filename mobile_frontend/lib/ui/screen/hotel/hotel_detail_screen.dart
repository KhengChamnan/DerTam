import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/hotel/amenities.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_booking_room_screen.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_room_card.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_select_date.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/facilities_list.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class HotelDetailScreen extends StatefulWidget {
  final String hotelId;
  const HotelDetailScreen({super.key, required this.hotelId});
  @override
  State<HotelDetailScreen> createState() => _HotelDetailScreenState();
}

class _HotelDetailScreenState extends State<HotelDetailScreen> {
  bool _isFavorite = false;

  // Mock room data - replace with actual API data later
  final List<Room> _mockRooms = [
    Room(
      roomId: '1',
      hotelId: 'hotel_001',
      roomType: 'Deluxe Room',
      maxGuest: '2 Adults, 1 Child',
      roomSize: '35 sqm',
      pricePerNight: '120.00',
      isAvailable: true,
      imageUrl:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      amenities: [
        Amendities(
          amenityId: 'am_1',
          roomId: '1',
          amenityName: 'Air Conditioning',
        ),
        Amendities(
          amenityId: 'am_2',
          roomId: '1',
          amenityName: 'Breakfast Included',
        ),
        Amendities(amenityId: 'am_3', roomId: '1', amenityName: 'Free WiFi'),
        Amendities(amenityId: 'am_4', roomId: '1', amenityName: 'Smart TV'),
      ],
    ),
    Room(
      roomId: '2',
      hotelId: 'hotel_001',
      roomType: 'Executive Suite',
      maxGuest: '3 Adults, 2 Children',
      roomSize: '55 sqm',
      pricePerNight: '185.00',
      isAvailable: true,
      imageUrl:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      amenities: [
        Amendities(
          amenityId: 'am_1',
          roomId: '2',
          amenityName: 'Air Conditioning',
        ),
        Amendities(
          amenityId: 'am_2',
          roomId: '2',
          amenityName: 'Breakfast Included',
        ),
        Amendities(amenityId: 'am_3', roomId: '2', amenityName: 'Free WiFi'),
        Amendities(amenityId: 'am_4', roomId: '2', amenityName: 'Smart TV'),
        Amendities(amenityId: 'am_5', roomId: '2', amenityName: 'Bathtub'),
        Amendities(amenityId: 'am_6', roomId: '2', amenityName: 'Balcony'),
      ],
    ),
    Room(
      roomId: '3',
      hotelId: 'hotel_001',
      roomType: 'Standard Room',
      maxGuest: '2 Adults',
      roomSize: '25 sqm',
      pricePerNight: '85.00',
      isAvailable: true,
      imageUrl:
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      amenities: [
        Amendities(
          amenityId: 'am_1',
          roomId: '3',
          amenityName: 'Air Conditioning',
        ),
        Amendities(amenityId: 'am_3', roomId: '3', amenityName: 'Free WiFi'),
        Amendities(amenityId: 'am_4', roomId: '3', amenityName: 'TV'),
      ],
    ),
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
          // App Bar with image
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
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
            actions: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: DertamColors.black.withOpacity(0.1),
                        spreadRadius: 0,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: Icon(
                      _isFavorite ? Iconsax.heart5 : Iconsax.heart,
                      color: _isFavorite
                          ? Colors.red
                          : DertamColors.primaryDark,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _isFavorite = !_isFavorite;
                      });
                    },
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                   Image.network(
                          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                          fit: BoxFit.cover,
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
                  // Restaurant name and rating
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Malis Cambodian Cuisine',
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
                          index < double.parse('2.0').floor()
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '4.5',
                        style: DertamTextStyles.body.copyWith(
                          fontWeight: FontWeight.w600,
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.s),
                  // Description
                  Text(
                    'Malis Cambodian Cuisine draws inspiration from the ancient Angkor period, offering a unique flavor profile created through a masterful blend of spices. Each dish reflects Cambodia\'s rich botanical heritage.',
                    style: DertamTextStyles.bodyMedium.copyWith(
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.m),
                  // Phone number
                  Row(
                    children: [
                      Icon(
                        Iconsax.call,
                        size: 16,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '+855 123456',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: DertamColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.xs),
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
                          'TK Map Link',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.l),
                  // Menu section title
                  Text(
                    'Facilities',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.s),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        FacilitiesList(
                          imageUrl:
                              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Room section title
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: DertamSpacings.m),
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
                final room = _mockRooms[index];
                return DertamRoomCard(
                  room: Room(
                    isAvailable: true,
                    roomSize: room.roomSize,
                    hotelId: room.hotelId,
                    roomId: room.roomId,
                    roomType: room.roomType,
                    imageUrl: room.imageUrl,
                    maxGuest: room.maxGuest,
                    amenities: room.amenities,
                    pricePerNight: room.pricePerNight,
                  ),
                  onCheckAvailability: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DertamBookingRoomScreen(room: room),
                    ),
                  ),
                );
              }, childCount: _mockRooms.length),
            ),
          ),
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
            final result = await DertamSelectDateDialog.show(context);
            if (result != null) {
              // Handle the search result
              print(
                'Searching for ${result['guestCount']} guests\n'
                'Check-in: ${result['checkInDate']}\n'
                'Check-out: ${result['checkOutDate']}\n'
                'Nights: ${result['numberOfNights']}',
              );
              // TODO: Implement room search logic here
              // You can navigate to a search results screen or filter rooms
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
