import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_frontend/ui/providers/place_provider.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';

class DertamUpcomingDetailScreen extends StatefulWidget {
  final String eventId;
  const DertamUpcomingDetailScreen({super.key, required this.eventId});

  @override
  State<DertamUpcomingDetailScreen> createState() =>
      _DertamUpcomingDetailScreenState();
}

class _DertamUpcomingDetailScreenState
    extends State<DertamUpcomingDetailScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final placeProvider = context.read<PlaceProvider>();
      placeProvider.fetchUpcomingEventDetail(widget.eventId);
    });
  }

  String formatDateDisplay(String date) {
    if (date.isEmpty) {
      return '';
    }
    try {
      DateTime parsedDate;
      bool hasTime = false;

      // Handle different date formats
      if (date.contains('T')) {
        // ISO 8601 format: 2025-11-29T09:30:00.000000Z
        parsedDate = DateTime.parse(date);
        hasTime = true;
      } else if (date.contains(' ') && date.contains('-')) {
        // Backend format: 2025-12-10 14:00:00
        parsedDate = DateFormat('yyyy-MM-dd HH:mm:ss').parse(date);
        hasTime = true;
      } else if (date.contains('.')) {
        // Format: 2025.11.29
        parsedDate = DateFormat('yyyy.MM.dd').parse(date);
      } else if (date.contains('-')) {
        // Format: 2025-11-29
        parsedDate = DateTime.parse(date);
      } else if (date.contains('/')) {
        // Format: 29/11/2025
        parsedDate = DateFormat('dd/MM/yyyy').parse(date);
      } else {
        return date;
      }

      // Get day with ordinal suffix
      int day = parsedDate.day;
      String suffix = _getOrdinalSuffix(day);
      String dayStr = day.toString().padLeft(2, '0');
      // Get month abbreviation
      String month = DateFormat('MMM').format(parsedDate);
      // Get year
      String year = parsedDate.year.toString();

      // Format time if available (e.g., 2:00 PM)
      if (hasTime) {
        String time = DateFormat('h:mm a').format(parsedDate);
        return '$dayStr$suffix $month $year, $time';
      }

      return '$dayStr$suffix - $month - $year';
    } catch (e) {
      // If parsing fails, return original format
      return date;
    }
  }

  String _getOrdinalSuffix(int day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  @override
  Widget build(BuildContext context) {
    final placeProvider = context.watch<PlaceProvider>();
    final eventDetailState = placeProvider.upcomingEventDetail;

    return Scaffold(
      backgroundColor: DertamColors.white,
      body: eventDetailState.when(
        empty: () => _buildEmptyState(),
        loading: () => _buildLoadingState(),
        error: (error) => _buildErrorState(error),
        success: (eventData) => _buildSuccessState(eventData),
      ),
    );
  }

  // Empty state widget
  Widget _buildEmptyState() {
    return const Center(
      child: Text(
        'No event details available',
        style: TextStyle(fontSize: 16, color: Colors.grey),
      ),
    );
  }

  // Loading state widget
  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator());
  }

  // Error state widget
  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 48),
          const SizedBox(height: 8),
          const Text(
            'Failed to load event details',
            style: TextStyle(color: Colors.red),
          ),
          const SizedBox(height: 4),
          Text(
            error.toString(),
            style: const TextStyle(fontSize: 12, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              context.read<PlaceProvider>().fetchUpcomingEventDetail(
                widget.eventId,
              );
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  // Success state widget - main content
  Widget _buildSuccessState(eventData) {
    return CustomScrollView(
      slivers: [
        // 1 - App bar with header image
        SliverAppBar(
          expandedHeight: 280,
          pinned: false,
          backgroundColor: DertamColors.white,
          leading: _buildBackButton(),
          flexibleSpace: FlexibleSpaceBar(
            background: _buildHeaderImage(eventData.imageUrl ?? ''),
          ),
        ),
        // 2 - Content
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(DertamSpacings.m),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Event Title
                Text(
                  eventData.name ?? 'Upcoming Event',
                  style: DertamTextStyles.heading.copyWith(
                    color: DertamColors.primaryBlue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: DertamSpacings.s),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        formatDateDisplay(eventData.startDate.toString()),
                        style: const TextStyle(
                          color: Color(0xFF526B8C),
                          fontSize: 14,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      formatDateDisplay(eventData.endDate.toString()),
                      style: const TextStyle(
                        color: Color(0xFF1F1F1F),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: DertamSpacings.s),
                // Event Description
                Text(
                  eventData.description ?? 'No description available',
                  style: DertamTextStyles.body.copyWith(
                    color: DertamColors.greyDark,
                    height: 1.5,
                  ),
                ),

                // Activity Sections
                const SizedBox(height: DertamSpacings.xl),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // Back button widget
  Widget _buildBackButton() {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: DertamColors.white.withOpacity(0.9),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: DertamColors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(Icons.arrow_back_ios_new, color: DertamColors.primaryDark),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  // Header image widget
  Widget _buildHeaderImage(String imageUrl) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.network(
          imageUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              color: DertamColors.backgroundAccent,
              child: Icon(
                Icons.event,
                color: DertamColors.neutralLight,
                size: 64,
              ),
            );
          },
        ),
        // Gradient overlay for better readability
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black.withOpacity(0.3)],
            ),
          ),
        ),
      ],
    );
  }
}
