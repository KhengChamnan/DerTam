import 'dart:async';

import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/amenityItem.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/room_thumail.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamBookingRoomScreen extends StatefulWidget {
  final Room room;
  const DertamBookingRoomScreen({super.key, required this.room});
  @override
  State<DertamBookingRoomScreen> createState() =>
      _DertamBookingHotelScreenState();
}

class _DertamBookingHotelScreenState extends State<DertamBookingRoomScreen> {
  int _currentImageIndex = 0;
  late PageController _pageController;
  Timer? _autoPlayTimer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _autoPlayTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPlay() {
    _autoPlayTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_pageController.hasClients) {
        int nextPage = (_currentImageIndex + 1) % 4; // 4 images in slideshow
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
    return Scaffold(
      backgroundColor: DertamColors.backgroundWhite,
      body: CustomScrollView(
        slivers: [
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
                  widget.room.imageUrl.isEmpty
                      ? Container(
                          color: Colors.grey[300],
                          child: Icon(
                            Icons.hotel,
                            size: 80,
                            color: Colors.grey[500],
                          ),
                        )
                      : PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() {
                              _currentImageIndex = index;
                            });
                          },
                          itemCount: 4, // Number of images to cycle through
                          itemBuilder: (context, index) {
                            return Image.network(
                              widget.room.imageUrl,
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
                  if (widget.room.imageUrl.isNotEmpty)
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          4,
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
          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(DertamSpacings.m),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Room name and price
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Family Room',
                        style: DertamTextStyles.title.copyWith(
                          color: DertamColors.primaryBlue,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: widget.room.pricePerNight.toString(),
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
                  SizedBox(
                    height: 70,
                    child: Row(
                      children: [
                        RoomThumbnail(imageUrl: widget.room.imageUrl),
                        const SizedBox(width: 8),
                        RoomThumbnail(imageUrl: widget.room.imageUrl),
                        const SizedBox(width: 8),
                        RoomThumbnail(imageUrl: widget.room.imageUrl),
                        const SizedBox(width: 8),
                        Container(
                          width: 70,
                          height: 70,
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              '+8 more',
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
                  Row(
                    children: [
                      Expanded(
                        child: AmenityItem(icon: Iconsax.wifi, label: 'WiFi'),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: AmenityItem(
                          icon: Iconsax.wind,
                          label: 'Air Conditioner',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.m),
                  Row(
                    children: [
                      Expanded(
                        child: AmenityItem(icon: Iconsax.cake, label: 'FOOD'),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: AmenityItem(icon: Icons.pool, label: 'POOL'),
                      ),
                    ],
                  ),
                  const SizedBox(height: DertamSpacings.s),

                  // See all link
                  GestureDetector(
                    onTap: () {},
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

                  // Properties details
                  Row(
                    children: [
                      _buildPropertyItem(Iconsax.maximize_3, '5m²'),
                      const SizedBox(width: 24),
                      _buildPropertyItem(Iconsax.profile_2user, '4 guests'),
                      const SizedBox(width: 24),
                      _buildPropertyItem(Iconsax.box, '1 bath'),
                      const SizedBox(width: 24),
                      _buildPropertyItem(Iconsax.home_1, '2 beds'),
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
                      // Star rating
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

                  // Message input
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

                  // Bottom price and button
                  Row(
                    children: [
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '\$69 ',
                              style: DertamTextStyles.title.copyWith(
                                color: DertamColors.primaryDark,
                                fontWeight: FontWeight.bold,
                                fontSize: 22,
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
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            // Handle booking
                          },
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

          // Room section title
        ],
      ),
    );
  }

  // Helper method to build thumbnail images

  // Helper method to build property items
  Widget _buildPropertyItem(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 18, color: DertamColors.primaryBlue),
        const SizedBox(width: 6),
        Text(
          label,
          style: DertamTextStyles.bodySmall.copyWith(
            color: DertamColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
