import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_frontend/models/hotel/room.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class DertamRoomCard extends StatelessWidget {
  final Room room;
  final VoidCallback? onCheckAvailability;
  const DertamRoomCard({
    super.key,
    required this.room,
    this.onCheckAvailability,
  });
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onCheckAvailability,
      child: Container(
        margin: const EdgeInsets.only(bottom: DertamSpacings.m),
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: BorderRadius.circular(DertamSpacings.radius),
          border: Border.all(color: Colors.grey[300]!, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              spreadRadius: 0,
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(DertamSpacings.m),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Room Image
              ClipRRect(
                borderRadius: BorderRadius.circular(DertamSpacings.radiusSmall),
                child: room.imagesUrl.isEmpty
                    ? Container(
                        width: 140,
                        height: 140,
                        color: Colors.grey[300],
                        child: Icon(
                          Iconsax.gallery,
                          size: 40,
                          color: Colors.grey[500],
                        ),
                      )
                    : Image.network(
                        room.imagesUrl.first,
                        width: 140,
                        height: 140,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 140,
                            height: 140,
                            color: Colors.grey[300],
                            child: Icon(
                              Iconsax.gallery_slash,
                              size: 40,
                              color: Colors.grey[500],
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(width: DertamSpacings.m),
              // Room Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Room Name and Price
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            room.roomType,
                            style: DertamTextStyles.body.copyWith(
                              color: DertamColors.primaryDark,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: DertamSpacings.xs),
                        // Price
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: '\$${room.pricePerNight} ',
                                style: DertamTextStyles.subtitle.copyWith(
                                  color: DertamColors.primaryDark,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                ),
                              ),
                              TextSpan(
                                text: 'nightly',
                                style: DertamTextStyles.bodySmall.copyWith(
                                  color: DertamColors.primaryDark,
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: DertamSpacings.xs),
                    // Capacity
                    Row(
                      children: [
                        Icon(
                          Iconsax.profile_2user,
                          size: 16,
                          color: Colors.grey[700],
                        ),
                        const SizedBox(width: 6),
                        Text(
                          room.maxGuests.toString(),
                          style: DertamTextStyles.bodySmall.copyWith(
                            color: Colors.grey[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: DertamSpacings.s),
                    Wrap(
                      spacing: DertamSpacings.s,
                      runSpacing: DertamSpacings.xs,
                      children: room.amenities.map((amenity) {
                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.abc, size: 18, color: Colors.grey[700]),
                            const SizedBox(width: 6),
                            Text(
                              amenity.amenityName,
                              style: DertamTextStyles.bodySmall.copyWith(
                                color: Colors.grey[700],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
