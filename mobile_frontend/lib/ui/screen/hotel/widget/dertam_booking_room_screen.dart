import 'dart:async';

import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_confiirm_booking.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_room_amenity.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DertamBookingRoomScreen extends StatefulWidget {
  final int roomId;
  const DertamBookingRoomScreen({super.key, required this.roomId});
  @override
  State<DertamBookingRoomScreen> createState() =>
      _DertamBookingHotelScreenState();
}

class _DertamBookingHotelScreenState extends State<DertamBookingRoomScreen> {
  int _currentImageIndex = 0;
  late PageController _pageController;
  Timer? _autoPlayTimer;
  int _numberOfRooms = 1;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hotelProvider = context.read<HotelProvider>();
      hotelProvider.fetchRoomDetail(widget.roomId.toString());
    });
  }

  @override
  void dispose() {
    _autoPlayTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPlay(int imageCount) {
    // Only start auto-play if there's more than one image
    if (imageCount <= 1) return;

    _autoPlayTimer?.cancel(); // Cancel existing timer if any
    _autoPlayTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_pageController.hasClients) {
        int nextPage = (_currentImageIndex + 1) % imageCount;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
        setState(() {
          _currentImageIndex = nextPage;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final roomAsyncValue = hotelProvider.roomDetail;
    // Handle different states
    if (roomAsyncValue.state == AsyncValueState.loading) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: DertamColors.primaryBlue),
              const SizedBox(height: DertamSpacings.m),
              Text(
                'Loading room details...',
                style: DertamTextStyles.bodyMedium.copyWith(
                  color: DertamColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (roomAsyncValue.state == AsyncValueState.error) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(DertamSpacings.l),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                const SizedBox(height: DertamSpacings.m),
                Text(
                  'Something went wrong',
                  style: DertamTextStyles.title.copyWith(
                    color: DertamColors.primaryDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: DertamSpacings.s),
                Text(
                  roomAsyncValue.error?.toString() ?? 'Unknown error occurred',
                  textAlign: TextAlign.center,
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: DertamColors.textSecondary,
                  ),
                ),
                const SizedBox(height: DertamSpacings.l),
                ElevatedButton.icon(
                  onPressed: () {
                    hotelProvider.fetchRoomDetail(widget.roomId.toString());
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DertamColors.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: DertamSpacings.l,
                      vertical: DertamSpacings.m,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
    if (roomAsyncValue.state == AsyncValueState.empty) {
      return Scaffold(
        backgroundColor: DertamColors.backgroundWhite,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(DertamSpacings.l),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.hotel_outlined, size: 64, color: Colors.grey[400]),
                const SizedBox(height: DertamSpacings.m),
                Text(
                  'No room data available',
                  style: DertamTextStyles.title.copyWith(
                    color: DertamColors.primaryDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: DertamSpacings.s),
                Text(
                  'Unable to load room details',
                  textAlign: TextAlign.center,
                  style: DertamTextStyles.bodyMedium.copyWith(
                    color: DertamColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Success state - display room data
    final roomData = roomAsyncValue.data!;
    final displayImages = roomData.imagesUrl.take(3).toList();
    final remainingImageCount = roomData.imagesUrl.length - 3;
    final amenities = roomData.amenities.take(4).toList();

    // Start auto-play only if there's more than one image
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startAutoPlay(roomData.imagesUrl.length);
    });

    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
          // AppBar with image carousel
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
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Image carousel or placeholder
                  roomData.imagesUrl.isEmpty
                      ? Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                DertamColors.primaryBlue.withOpacity(0.3),
                                DertamColors.primaryDark.withOpacity(0.3),
                              ],
                            ),
                          ),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.image_outlined,
                                  size: 64,
                                  color: DertamColors.primaryBlue.withOpacity(
                                    0.6,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'No images available',
                                  style: DertamTextStyles.bodyMedium.copyWith(
                                    color: DertamColors.primaryDark.withOpacity(
                                      0.6,
                                    ),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() {
                              _currentImageIndex = index;
                            });
                          },
                          itemCount: roomData.imagesUrl.length,
                          itemBuilder: (context, index) {
                            return Image.network(
                              roomData.imagesUrl[index],
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
                            );
                          },
                        ),
                  // Page indicator
                  if (roomData.imagesUrl.isNotEmpty)
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          roomData.imagesUrl.length,
                          (index) => Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _currentImageIndex == index
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.5),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          // Main content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(DertamSpacings.m),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Room header with name and price
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          roomData.roomType,
                          style: DertamTextStyles.title.copyWith(
                            color: DertamColors.primaryBlue,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text:
                                  '\$${roomData.pricePerNight.toStringAsFixed(0)} ',
                              style: DertamTextStyles.title.copyWith(
                                color: DertamColors.primaryDark,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            ),
                            TextSpan(
                              text: 'nightly',
                              style: DertamTextStyles.bodyMedium.copyWith(
                                color: DertamColors.textSecondary,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.m),

                  // Thumbnail images
                  if (roomData.imagesUrl.isNotEmpty)
                    SizedBox(
                      height: 70,
                      child: Row(
                        children: [
                          ...displayImages.map(
                            (url) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: _RoomThumbnail(imageUrl: url),
                            ),
                          ),
                          if (remainingImageCount > 0)
                            Container(
                              width: 70,
                              height: 70,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.6),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  '+$remainingImageCount more',
                                  style: DertamTextStyles.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  const SizedBox(height: DertamSpacings.l),

                  // About this property section
                  Text(
                    'About this property',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.m),

                  // Amenities grid
                  if (roomData.amenities.isNotEmpty) ...[
                    if (amenities.length >= 2)
                      Row(
                        children: [
                          Expanded(
                            child: AmenityItem(
                              icon: Iconsax.wifi,
                              label: amenities[0].amenityName,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: AmenityItem(
                              icon: Iconsax.wind,
                              label: amenities[1].amenityName,
                            ),
                          ),
                        ],
                      ),
                    if (amenities.length >= 4) ...[
                      const SizedBox(height: DertamSpacings.m),
                      Row(
                        children: [
                          Expanded(
                            child: AmenityItem(
                              icon: Iconsax.cake,
                              label: amenities[2].amenityName,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: AmenityItem(
                              icon: Icons.pool,
                              label: amenities[3].amenityName,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: DertamSpacings.s),
                  ],

                  // See all link
                  GestureDetector(
                    onTap: () {
                      // Handle see all amenities
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text(
                          'See all about this property',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            color: DertamColors.primaryBlue,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 14,
                          color: DertamColors.primaryBlue,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.l),

                  // Properties section
                  Text(
                    'Properties',
                    style: DertamTextStyles.title.copyWith(
                      color: DertamColors.primaryDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.m),
                  Row(
                    children: [
                      Row(
                        children: [
                          Icon(
                            Iconsax.maximize_3,
                            size: 18,
                            color: DertamColors.primaryBlue,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            roomData.roomSize,
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: DertamColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 24),
                      Row(
                        children: [
                          Icon(
                            Iconsax.profile_2user,
                            size: 18,
                            color: DertamColors.primaryBlue,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${roomData.maxGuests} guests',
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: DertamColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 24),
                      Row(
                        children: [
                          Icon(
                            Iconsax.box,
                            size: 18,
                            color: DertamColors.primaryBlue,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '1 bath',
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: DertamColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 24),
                      Row(
                        children: [
                          Icon(
                            Iconsax.home_1,
                            size: 18,
                            color: DertamColors.primaryBlue,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '2 beds',
                            style: DertamTextStyles.bodySmall.copyWith(
                              color: DertamColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.l),

                  // Rating and Reviews section
                  Row(
                    children: [
                      Text(
                        'Rating and Reviews',
                        style: DertamTextStyles.title.copyWith(
                          color: DertamColors.primaryDark,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          ...List.generate(
                            4,
                            (index) =>
                                Icon(Icons.star, size: 18, color: Colors.amber),
                          ),
                          Icon(Icons.star_half, size: 18, color: Colors.amber),
                        ],
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '4.5',
                        style: DertamTextStyles.bodyMedium.copyWith(
                          color: DertamColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.m),

                  // Review input
                  TextField(
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Write message',
                      hintStyle: DertamTextStyles.bodyMedium.copyWith(
                        color: DertamColors.textSecondary.withOpacity(0.5),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Colors.grey.shade300,
                          width: 1,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Colors.grey.shade300,
                          width: 1,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: DertamColors.primaryBlue,
                          width: 1.5,
                        ),
                      ),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                  const SizedBox(height: DertamSpacings.l),

                  // Booking footer with price and button
                  Row(
                    children: [
                      // Room counter controls
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: DertamColors.primaryBlue.withOpacity(0.3),
                            width: 1.5,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            // Decrease button
                            IconButton(
                              onPressed: _numberOfRooms > 1
                                  ? () {
                                      setState(() {
                                        _numberOfRooms--;
                                      });
                                    }
                                  : null,
                              icon: Icon(
                                Icons.remove,
                                color: _numberOfRooms > 1
                                    ? DertamColors.primaryBlue
                                    : Colors.grey,
                                size: 20,
                              ),
                              padding: const EdgeInsets.all(8),
                              constraints: const BoxConstraints(
                                minWidth: 40,
                                minHeight: 40,
                              ),
                            ),
                            // Room count display
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              child: Text(
                                '$_numberOfRooms',
                                style: DertamTextStyles.title.copyWith(
                                  color: DertamColors.primaryDark,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            // Increase button
                            IconButton(
                              onPressed: () {
                                setState(() {
                                  _numberOfRooms++;
                                });
                              },
                              icon: Icon(
                                Icons.add,
                                color: DertamColors.primaryBlue,
                                size: 20,
                              ),
                              padding: const EdgeInsets.all(8),
                              constraints: const BoxConstraints(
                                minWidth: 40,
                                minHeight: 40,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DertamConfirmBooking(
                                roomType: roomData.roomType,
                                pricePerNight: roomData.pricePerNight,
                                numberOfRooms: _numberOfRooms,
                                roomImage: roomData.imagesUrl,
                                maxGuests: roomData.maxGuests,
                              ),
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DertamColors.primaryDark,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          child: Text(
                            'Book Now',
                            style: DertamTextStyles.buttonLarge.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.l),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoomThumbnail extends StatelessWidget {
  final String imageUrl;

  const _RoomThumbnail({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        image: imageUrl.isNotEmpty
            ? DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover)
            : null,
        color: imageUrl.isEmpty ? Colors.grey[300] : null,
      ),
      child: imageUrl.isEmpty
          ? Icon(Icons.hotel, color: Colors.grey[500])
          : null,
    );
  }
}
