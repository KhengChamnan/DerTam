import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/province/province_category_detail.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/providers/hotel_provider.dart';
import 'package:mobile_frontend/ui/screen/hotel/widget/dertam_search_room_result.dart';
import 'package:mobile_frontend/ui/screen/place_datail/widget/dertam_hotel_nearby_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/widgets/navigation/navigation_bar.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class DertamHotelScreen extends StatefulWidget {
  const DertamHotelScreen({super.key});

  @override
  State<DertamHotelScreen> createState() => _DertamHotelScreenState();
}

class _DertamHotelScreenState extends State<DertamHotelScreen> {
  String selectedLocationName = 'Siem Reap';
  int? selectedLocationId;
  late DateTime checkInDate;
  late DateTime checkOutDate;
  List<ProvinceCategoryDetail> _locations = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Fetch locations from BusBookingProvider
      final busBookingProvider = context.read<BusBookingProvider>();
      busBookingProvider.fetchListLocation().then((locations) {
        setState(() {
          _locations = locations;
          if (locations.isNotEmpty) {
            selectedLocationName =
                locations.first.provinceCategoryName ?? 'Siem Reap';
            selectedLocationId = locations.first.provinceCategoryID;
          }
        });
      });
    });
    checkInDate = DateTime.now();
    checkOutDate = DateTime.now().add(const Duration(days: 1));
  }

  Future<void> _selectDate(BuildContext context, bool isCheckIn) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isCheckIn ? checkInDate : checkOutDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: DertamColors.primaryBlue,
              onPrimary: Colors.white,
              onSurface: DertamColors.primaryDark,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          checkInDate = picked;
        } else {
          checkOutDate = picked;
        }
      });
    }
  }

  void _showLocationPicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Select Location',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              if (_locations.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _locations.length,
                    itemBuilder: (context, index) {
                      final location = _locations[index];
                      return ListTile(
                        title: Text(location.provinceCategoryName ?? 'Unknown'),
                        onTap: () {
                          setState(() {
                            selectedLocationName =
                                location.provinceCategoryName ?? 'Unknown';
                            selectedLocationId = location.provinceCategoryID;
                          });
                          Navigator.pop(context);
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  void fetchHotels() async {
    if (selectedLocationId == null) return;
    final hotelProvider = context.read<HotelProvider>();
    await hotelProvider.searchAllHotelList(
      selectedLocationId!,
      checkInDate,
      checkOutDate,
    );
  }

  Future<void> _onRefresh() async {
    if (selectedLocationId == null) return;
    final hotelProvider = context.read<HotelProvider>();
    await hotelProvider.searchAllHotelList(
      selectedLocationId!,
      checkInDate,
      checkOutDate,
    );
  }

  @override
  Widget build(BuildContext context) {
    final hotelProvider = context.watch<HotelProvider>();
    final hotelListData = hotelProvider.searchHotel;
    // Safely access first element - use firstOrNull or check if list is not empty

    Widget hotelList;
    switch (hotelListData.state) {
      case AsyncValueState.empty:
        hotelList = SizedBox(
          height: 150,
          child: Center(
            child: Text(
              'No hotels available',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
        );
        break;
      case AsyncValueState.loading:
        hotelList = SizedBox(
          height: 150,
          child: Center(child: CircularProgressIndicator()),
        );
        break;
      case AsyncValueState.error:
        hotelList = SizedBox(
          height: 150,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 8),
                const Text(
                  'Failed to load hotels',
                  style: TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 4),
                Text(
                  'Oops! Something went wrong',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
        break;
      case AsyncValueState.success:
        if (hotelListData.data?.hotels.isEmpty ?? true) {
          hotelList = SizedBox(
            height: 150,
            child: Center(
              child: Text(
                'No hotels found for the selected criteria',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          );
        } else {
          hotelList = SizedBox(
            height: 150,
            child: ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: hotelListData.data?.hotels.length ?? 0,
              itemBuilder: (context, index) {
                final hotel = hotelListData.data?.hotels[index];
                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: DertamHotelNearby(
                    name: hotel?.name ?? 'No Hotel',
                    location:
                        hotel?.provinceCategory.provinceCategoryName ??
                        'No Province',
                    rating: hotel?.rating.toString() ?? '',
                    imageUrl: (hotel?.imagesUrl.isNotEmpty ?? false)
                        ? hotel!.imagesUrl.first
                        : '',
                    reviewCount: hotel?.reviewCount.toString(),
                    onTap: () async {
                      try {
                        final searchResults = await hotelProvider
                            .searchAvailableRoom(
                              checkInDate,
                              checkOutDate,
                              1,
                              hotel?.placeId.toString() ?? '',
                            );
                        if (mounted && searchResults.rooms.isNotEmpty) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  const DertamSearchRoomResult(),
                            ),
                          );
                        } else if (mounted) {
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
                    },
                  ),
                );
              },
            ),
          );

          break;
        }
    }
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _onRefresh,
          color: DertamColors.primaryBlue,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero image with travel collage
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage(
                        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
                      ),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.3),
                          Colors.black.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: Stack(
                      children: [
                        // Main text
                        Positioned(
                          left: 39,
                          top: 40,
                          right: 120,
                          child: RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                fontFamily: 'Manuale',
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                height: 1.25,
                              ),
                              children: [
                                const TextSpan(
                                  text:
                                      'Open your mind and\nstart your next journey\nwith ',
                                  style: TextStyle(fontSize: 24),
                                ),
                                TextSpan(
                                  text: 'DER TAM',
                                  style: TextStyle(
                                    fontSize: 32,
                                    color: DertamColors.primaryBlue,
                                  ),
                                ),
                                const TextSpan(
                                  text: '.',
                                  style: TextStyle(fontSize: 32),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Image collage on the right
                        Positioned(
                          right: 4,
                          top: 51,
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  _BuildSmallImage(
                                    url:
                                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200',
                                    width: 108,
                                    height: 81,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _BuildSmallImage(
                                    url:
                                        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
                                    width: 108,
                                    height: 81,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _BuildSmallImage(
                                    url:
                                        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=200',
                                    width: 53,
                                    height: 51,
                                  ),
                                  const SizedBox(width: 5),
                                  _BuildSmallImage(
                                    url:
                                        'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=200',
                                    width: 50,
                                    height: 51,
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

                Transform.translate(
                  offset: const Offset(0, -50),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Location
                        Text(
                          'Location',
                          style: DertamTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 4),
                        InkWell(
                          onTap: _showLocationPicker,
                          child: Row(
                            children: [
                              const Icon(Icons.location_on, size: 16),
                              const SizedBox(width: 6),
                              Text(
                                selectedLocationName,
                                style: DertamTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: DertamColors.black,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                Icons.keyboard_arrow_down,
                                size: 14,
                                color: DertamColors.neutralLight,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Check In and Check Out
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Check In',
                                    style: DertamTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: DertamColors.neutralLighter,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  InkWell(
                                    onTap: () => _selectDate(context, true),
                                    child: Row(
                                      children: [
                                        const Icon(Iconsax.calendar, size: 16),
                                        const SizedBox(width: 6),
                                        Text(
                                          DateFormat(
                                            'dd MMMM yyyy',
                                          ).format(checkInDate),
                                          style: DertamTextStyles.bodySmall
                                              .copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: DertamColors.black,
                                              ),
                                        ),
                                        const SizedBox(width: 4),
                                        Icon(
                                          Icons.keyboard_arrow_down,
                                          size: 14,
                                          color: DertamColors.neutralLight,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 58,
                              color: Colors.grey[300],
                              margin: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Check Out',
                                    style: DertamTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  InkWell(
                                    onTap: () => _selectDate(context, false),
                                    child: Row(
                                      children: [
                                        const Icon(Iconsax.calendar, size: 16),
                                        const SizedBox(width: 6),
                                        Text(
                                          DateFormat(
                                            'dd MMMM yyyy',
                                          ).format(checkOutDate),
                                          style: DertamTextStyles.bodySmall
                                              .copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: Colors.black,
                                              ),
                                        ),
                                        const SizedBox(width: 4),
                                        Icon(
                                          Icons.keyboard_arrow_down,
                                          size: 14,
                                          color: Colors.grey,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        // Search Button
                        DertamButton(
                          text: 'Search',
                          onPressed: fetchHotels,
                          backgroundColor: DertamColors.primaryDark,
                        ),
                      ],
                    ),
                  ),
                ),

                Transform.translate(
                  offset: const Offset(0, -30),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'List of hotel',
                          style: DertamTextStyles.body.copyWith(
                            fontWeight: FontWeight.bold,
                            color: DertamColors.primaryBlue,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      hotelList,
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const Navigationbar(currentIndex: 3),
    );
  }
}

class _BuildSmallImage extends StatelessWidget {
  final String url;
  final double width;
  final double height;
  const _BuildSmallImage({
    required this.url,
    required this.width,
    required this.height,
  });
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
      ),
    );
  }
}
