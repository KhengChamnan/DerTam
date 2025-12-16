import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/place/place.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

/// A reusable card widget for displaying place search results
class PlaceSearchCard extends StatelessWidget {
  final Place place;
  final VoidCallback? onTap;

  const PlaceSearchCard({super.key, required this.place, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: DertamSpacings.m),
        decoration: BoxDecoration(
          color: DertamColors.white,
          borderRadius: BorderRadius.circular(DertamSpacings.radius),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Place Image
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(DertamSpacings.radius),
                bottomLeft: Radius.circular(DertamSpacings.radius),
              ),
              child: SizedBox(
                width: 100,
                height: 100,
                child: Image.network(
                  place.imagesUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: DertamColors.backgroundAccent,
                      child: Icon(
                        Icons.image_not_supported,
                        color: DertamColors.neutralLighter,
                        size: 32,
                      ),
                    );
                  },
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: DertamColors.backgroundAccent,
                      child: Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: DertamColors.primaryBlue,
                          value: loadingProgress.expectedTotalBytes != null
                              ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                              : null,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Place Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(DertamSpacings.m),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Place Name
                    Text(
                      place.name,
                      style: DertamTextStyles.body.copyWith(
                        fontWeight: FontWeight.w600,
                        color: DertamColors.primaryDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Location
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: DertamColors.neutralLight,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            place.locationName,
                            style: DertamTextStyles.label.copyWith(
                              color: DertamColors.neutralLight,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Rating
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: DertamColors.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                place.ratings.toStringAsFixed(1),
                                style: DertamTextStyles.label.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: DertamColors.primaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
