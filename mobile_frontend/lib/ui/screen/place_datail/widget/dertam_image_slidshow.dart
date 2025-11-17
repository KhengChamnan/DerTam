import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamImageSlideshow extends StatefulWidget {
  final List<String> images;
  final VoidCallback? onRoutePressed;

  const DertamImageSlideshow({
    super.key,
    required this.images,
    this.onRoutePressed,
  });

  @override
  State<DertamImageSlideshow> createState() => _DertamImageSlideshowState();
}

class _DertamImageSlideshowState extends State<DertamImageSlideshow> {
  late PageController _pageController;
  int _currentImageIndex = 0;
  Timer? _autoScrollTimer;
  bool _isAutoScrolling = true;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoScroll();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    if (_isAutoScrolling &&
        widget.images.isNotEmpty &&
        widget.images.length > 1) {
      _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
        if (_pageController.hasClients && widget.images.isNotEmpty) {
          int nextPage = (_currentImageIndex + 1) % widget.images.length;
          _pageController.animateToPage(
            nextPage,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
        }
      });
    }
  }

  void _stopAutoScroll() {
    setState(() {
      _isAutoScrolling = false;
    });
    _autoScrollTimer?.cancel();
  }

  void _resumeAutoScroll() {
    setState(() {
      _isAutoScrolling = true;
    });
    _startAutoScroll();
  }

  void _onImageTap(int index) {
    _stopAutoScroll();
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
    // Resume auto-scroll after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        _resumeAutoScroll();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SizedBox(
          height: 400,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentImageIndex = index;
              });
            },
            itemCount: widget.images.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () {
                  // Stop auto-scroll when user taps
                  _stopAutoScroll();
                  Future.delayed(const Duration(seconds: 5), () {
                    if (mounted) _resumeAutoScroll();
                  });
                },
                child: Image.network(
                  widget.images[index],
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.image_not_supported, size: 50),
                    );
                  },
                ),
              );
            },
          ),
        ),

        // Back Button
        Positioned(
          top: 32,
          left: 16,
          child: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.arrow_back_ios_new,
                size: 20,
                color: DertamColors.primaryBlue,
              ),
            ),
          ),
        ),

        // Thumbnail Gallery on Left Side (Vertical)
        Positioned(
          left: 16,
          bottom: 4,
          child: Container(
            width: 70,
            constraints: const BoxConstraints(
              maxHeight: 280, // Limit height to show max 3.5 thumbnails
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: ListView.builder(
                physics: const BouncingScrollPhysics(),
                itemCount: widget.images.length > 4 ? 4 : widget.images.length,
                itemBuilder: (context, index) {
                  bool isSelected = index == _currentImageIndex;
                  bool isLastItem = index == 3 && widget.images.length > 4;

                  return GestureDetector(
                    onTap: () => _onImageTap(index),
                    child: Container(
                      width: 70,
                      height: 70,
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? Colors.white : Colors.transparent,
                          width: 2.5,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: Colors.white.withOpacity(0.6),
                                  blurRadius: 6,
                                  spreadRadius: 1,
                                ),
                              ]
                            : [],
                      ),
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: Image.network(
                              widget.images[index],
                              fit: BoxFit.cover,
                              width: 70,
                              height: 70,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.grey[400],
                                  child: const Icon(Icons.image, size: 24),
                                );
                              },
                            ),
                          ),
                          // Overlay for "+X" on last thumbnail
                          if (isLastItem)
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.6),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Center(
                                child: Text(
                                  '+${widget.images.length - 3}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        // Route Button on Bottom Right
        Positioned(
          right: 16,
          bottom: 20,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
            ),
            child: ElevatedButton.icon(
              onPressed: widget.onRoutePressed,
              icon: const Icon(Iconsax.routing, size: 16),
              label: Text(
                'Route',
                style: DertamTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: DertamColors.primaryDark,
                ),
              ),
              style: ElevatedButton.styleFrom(
                foregroundColor: DertamColors.primaryDark,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 18,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                  side: BorderSide(color: DertamColors.primaryDark, width: 0.5),
                ),
                elevation: 8,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Info Card Widget - Stateless
class DertamInfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const DertamInfoCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DertamColors.primaryPurple.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DertamColors.primaryPurple.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: DertamColors.primaryPurple, size: 24),
          const SizedBox(height: 8),
          Text(title, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
