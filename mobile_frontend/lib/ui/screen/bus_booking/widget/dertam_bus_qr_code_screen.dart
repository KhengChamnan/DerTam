import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/bus_booking_provider.dart';
import 'package:mobile_frontend/ui/screen/bus_booking/dertam_bus_booking_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

class DertamBusQrCodeScreen extends StatefulWidget {
  final String? qrData;
  final String? qrImage;
  final String bookingId;

  const DertamBusQrCodeScreen({
    super.key,
    this.qrData,
    this.qrImage,
    required this.bookingId,
  });

  @override
  State<DertamBusQrCodeScreen> createState() => _DertamBusQrCodeScreenState();
}

class _DertamBusQrCodeScreenState extends State<DertamBusQrCodeScreen> {
  Timer? _pollingTimer;
  String _paymentStatus = 'pending';
  bool _isChecking = false;
  int _checkCount = 0;
  static const int _maxChecks = 60; // Poll for 5 minutes (60 * 5 seconds)

  @override
  void initState() {
    super.initState();
    _startPolling();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    // Check immediately
    _checkPaymentStatus();
    // Then check every 5 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _checkCount++;
      if (_checkCount >= _maxChecks || _paymentStatus == 'confirmed') {
        timer.cancel();
        if (_paymentStatus == 'confirmed') {
          _showSuccessAndClose();
        }
      } else {
        _checkPaymentStatus();
      }
    });
  }

  Future<void> _checkPaymentStatus() async {
    if (_isChecking) return;
    setState(() => _isChecking = true);
    try {
      final provider = Provider.of<BusBookingProvider>(context, listen: false);
      // Fetch the latest booking details from the server
      final bookingDetail = await provider.fetchBusBookingDetails(
        widget.bookingId,
      );
      final status = bookingDetail.bookings.first.status;
      setState(() {
        _paymentStatus = status.toLowerCase();
        _isChecking = false;
      });
      print('Payment status check: $_paymentStatus'); // Debug log

      if (_paymentStatus == 'confirmed') {
        _pollingTimer?.cancel();
        _showSuccessAndClose();
      }
    } catch (e) {
      setState(() => _isChecking = false);
      print('Error checking payment status: $e');
    }
  }

  void _showSuccessAndClose() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 32),
            const SizedBox(width: 12),
            const Text('Payment Successful!'),
          ],
        ),
        content: const Text(
          'Your payment has been confirmed. Thank you for your booking!',
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              // Navigate to home page and remove all previous routes
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(
                  builder: (context) => const DertamBusBookingScreen(),
                ),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DertamColors.primaryBlue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _onRefresh() async {
    await _checkPaymentStatus();
  }

  @override
  Widget build(BuildContext context) {
    // Validate QR data
    if (widget.qrData == null || widget.qrData!.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: DertamColors.primaryDark),
            onPressed: () => Navigator.of(context).pop(false),
          ),
          title: Text(
            'QR Code Error',
            style: TextStyle(
              color: DertamColors.primaryBlue,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 80, color: Colors.red),
              const SizedBox(height: 16),
              const Text(
                'No QR code data available',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              const Text(
                'Please try again or contact support',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: DertamColors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: DertamColors.primaryBlue.withOpacity(0.4),
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
              onPressed: () => Navigator.of(context).pop(false),
            ),
          ),
        ),
        title: Text(
          'Scan to Pay',
          style: TextStyle(
            color: DertamColors.primaryBlue,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              children: [
                // Status Indicator
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 16,
                  ),
                  color: _paymentStatus == 'confirmed'
                      ? Colors.green.shade50
                      : Colors.orange.shade50,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isChecking)
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              _paymentStatus == 'confirmed'
                                  ? Colors.green
                                  : Colors.orange,
                            ),
                          ),
                        )
                      else
                        Icon(
                          _paymentStatus == 'confirmed'
                              ? Icons.check_circle
                              : Icons.pending,
                          color: _paymentStatus == 'confirmed'
                              ? Colors.green
                              : Colors.orange,
                          size: 20,
                        ),
                      const SizedBox(width: 8),
                      Text(
                        _paymentStatus == 'confirmed'
                            ? 'Payment Confirmed'
                            : 'Waiting for Payment...',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _paymentStatus == 'confirmed'
                              ? Colors.green.shade800
                              : Colors.orange.shade800,
                        ),
                      ),
                    ],
                  ),
                ),
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    border: Border(
                      bottom: BorderSide(color: Colors.blue.shade200, width: 1),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.qr_code_scanner,
                            color: DertamColors.primaryBlue,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Scan with any banking app',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: DertamColors.primaryBlue,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Use ABA Mobile, Wing, ACLEDA, or any KHQR-compatible app',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),
                // QR Code
                Container(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: DertamColors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: DertamColors.primaryBlue.withOpacity(0.1),
                              blurRadius: 20,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: QrImageView(
                          data: widget.qrData!,
                          version: QrVersions.auto,
                          size: 280,
                          backgroundColor: Colors.white,
                          errorCorrectionLevel: QrErrorCorrectLevel.H,
                        ),
                      ),
                    ],
                  ),
                ),
                // Confirm Payment Button
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: DertamColors.primaryBlue.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).pop(false);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DertamColors.primaryBlue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 55),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        child: const Text(
                          'Cancel Payment',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
