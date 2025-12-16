import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:mobile_frontend/models/place/upcoming_event_place.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:dots_indicator/dots_indicator.dart';
import 'package:provider/provider.dart';

class HomeSlideShow extends StatefulWidget {
  const HomeSlideShow({super.key});

  @override
  State<HomeSlideShow> createState() => _HomeSlideShowState();
}

class _HomeSlideShowState extends State<HomeSlideShow> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PlaceProvider>().fetchSlideShow();
    });
  }

  @override
  Widget build(BuildContext context) {
    final placeProvider = context.watch<PlaceProvider>();
    final slideShowState = placeProvider.slideShow;

    return slideShowState.when(
      empty: () => _buildPlaceholder(),
      loading: () => _buildLoading(),
      error: (error) => _buildError(error),
      success: (slides) => _buildSlideShow(slides),
    );
  }

  Widget _buildPlaceholder() {
    return SizedBox(
      height: 220,
      child: Center(
        child: Text(
          'No slides available',
          style: TextStyle(color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return SizedBox(
      height: 220,
      child: Center(
        child: CircularProgressIndicator(color: DertamColors.primaryBlue),
      ),
    );
  }

  Widget _buildError(Object error) {
    return SizedBox(
      height: 220,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red),
            SizedBox(height: 8),
            Text('Failed to load slides', style: TextStyle(color: Colors.red)),
            TextButton(
              onPressed: () {
                context.read<PlaceProvider>().fetchSlideShow();
              },
              child: Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlideShow(List<UpcomingEventPlace> slides) {
    if (slides.isEmpty) {
      return _buildPlaceholder();
    }

    return Column(
      children: [
        CarouselSlider(
          options: CarouselOptions(
            height: 220,
            enlargeCenterPage: true,
            autoPlay: true,
            aspectRatio: 16 / 9,
            autoPlayCurve: Curves.fastOutSlowIn,
            enableInfiniteScroll: true,
            autoPlayAnimationDuration: Duration(milliseconds: 1000),
            viewportFraction: 1.0,
            onPageChanged: (index, reason) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          items: slides.map((slide) {
            return Builder(
              builder: (BuildContext context) {
                return Container(
                  width: MediaQuery.of(context).size.width,
                  margin: EdgeInsets.symmetric(horizontal: 5.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20.0),
                    child: Image.network(
                      slide.imageUrl ?? '',
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                : null,
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[200],
                          child: Icon(
                            Icons.image,
                            size: 120,
                            color: Colors.grey,
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
            );
          }).toList(),
        ),
        SizedBox(height: 16),
        DotsIndicator(
          dotsCount: slides.length,
          position: _currentIndex,
          decorator: DotsDecorator(
            size: const Size.square(8.0),
            activeSize: const Size(24.0, 8.0),
            activeShape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5.0),
            ),
            activeColor: DertamColors.primaryBlue,
            spacing: EdgeInsets.all(4),
          ),
        ),
      ],
    );
  }
}
