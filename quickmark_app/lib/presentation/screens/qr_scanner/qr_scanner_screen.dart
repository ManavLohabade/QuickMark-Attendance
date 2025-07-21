import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'dart:io';
import '../../bloc/attendance/attendance_bloc.dart';
import '../../bloc/attendance/attendance_event.dart';
import '../../bloc/attendance/attendance_state.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/auth/auth_state.dart';
import '../face_registration/face_registration_screen.dart';

class QRScannerScreen extends StatefulWidget {
  static const routeName = '/qr-scanner';

  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  Barcode? result;
  QRViewController? controller;
  bool _isScanning = true;
  bool _isFlashOn = false;

  @override
  void initState() {
    super.initState();
    _checkFaceRegistration();
  }

  void _checkFaceRegistration() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      final user = authState.user;
      if (!user.isFaceRegistered) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showFaceRegistrationDialog();
        });
      }
    }
  }

  void _showFaceRegistrationDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text(
            'Face Registration Required',
            style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Roboto'),
          ),
          content: const Text(
            'You need to register your face before using QR attendance. This ensures secure attendance tracking.',
            style: TextStyle(fontFamily: 'Roboto'),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context); // Go back to previous screen
              },
              child: const Text(
                'Cancel',
                style: TextStyle(fontFamily: 'Roboto'),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pushReplacementNamed(
                  context,
                  FaceRegistrationScreen.routeName,
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4A90E2),
                foregroundColor: Colors.white,
              ),
              child: const Text(
                'Register Face',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  void reassemble() {
    super.reassemble();
    if (Platform.isAndroid) {
      controller!.pauseCamera();
    } else if (Platform.isIOS) {
      controller!.resumeCamera();
    }
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      if (_isScanning && scanData.code != null) {
        setState(() {
          result = scanData;
          _isScanning = false;
        });
        _handleQRCodeScanned(scanData.code!);
      }
    });
  }

  void _handleQRCodeScanned(String qrData) {
    // Pause the scanner
    controller?.pauseCamera();

    // Debug print the scanned QR data
    print('QR Code Scanned: $qrData');

    // Show immediate feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'QR Code Detected: ${qrData.length > 50 ? '${qrData.substring(0, 50)}...' : qrData}',
        ),
        backgroundColor: const Color(0xFF4A90E2),
        duration: const Duration(seconds: 2),
      ),
    );

    // Send QR data to attendance bloc
    context.read<AttendanceBloc>().add(ScanQRCodeEvent(qrData: qrData));
  }

  void _toggleFlash() async {
    if (controller != null) {
      await controller!.toggleFlash();
      setState(() {
        _isFlashOn = !_isFlashOn;
      });
    }
  }

  void _resumeScanning() {
    setState(() {
      result = null;
      _isScanning = true;
    });
    controller?.resumeCamera();
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        title: const Text(
          'Scan QR Code',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF4A90E2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _isFlashOn ? Icons.flash_on : Icons.flash_off,
              color: Colors.white,
            ),
            onPressed: _toggleFlash,
            tooltip: 'Toggle Flash',
          ),
        ],
      ),
      body: BlocListener<AttendanceBloc, AttendanceState>(
        listener: (context, state) {
          if (state is AttendanceQRCodeScanned) {
            // QR code scanned successfully, now mark attendance
            context.read<AttendanceBloc>().add(
              MarkAttendanceEvent(
                verifySessionToken:
                    state.sessionData['sessionToken'] ?? 'default_token',
                faceVerify: false, // QR scan doesn't require face verification
              ),
            );
          } else if (state is AttendanceMarked) {
            // Attendance marked successfully
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(0xFF50E3C2),
                duration: const Duration(seconds: 3),
              ),
            );
          } else if (state is AttendanceError) {
            // Error occurred
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(0xFFD0021B),
                duration: const Duration(seconds: 3),
              ),
            );
            // Allow scanning again after error
            _resumeScanning();
          }
        },
        child: Stack(
          children: [
            // QR Scanner View
            QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
              overlay: QrScannerOverlayShape(
                borderColor: const Color(0xFF50E3C2),
                borderRadius: 10,
                borderLength: 30,
                borderWidth: 10,
                cutOutSize: MediaQuery.of(context).size.width * 0.8,
              ),
            ),

            // QR Scanner Custom Overlay
            Positioned.fill(child: _buildScannerOverlay()),

            // Instructions
            Positioned(
              top: 40,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Point your camera at the QR code',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'Roboto',
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'displayed by your faculty member',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        fontFamily: 'Roboto',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isScanning
                              ? Icons.qr_code_scanner
                              : Icons.pause_circle,
                          color: _isScanning
                              ? const Color(0xFF50E3C2)
                              : Colors.orange,
                          size: 16,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _isScanning ? 'Ready to scan' : 'Processing...',
                          style: TextStyle(
                            color: _isScanning
                                ? const Color(0xFF50E3C2)
                                : Colors.orange,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Roboto',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Action buttons
            Positioned(
              bottom: 100,
              left: 0,
              right: 0,
              child: Center(
                child: BlocBuilder<AttendanceBloc, AttendanceState>(
                  builder: (context, state) {
                    final isLoading = state is AttendanceLoading;

                    return Column(
                      children: [
                        if (result != null && !_isScanning) ...[
                          // Show scanned result
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              children: [
                                const Text(
                                  'QR Code Scanned Successfully!',
                                  style: TextStyle(
                                    color: Color(0xFF50E3C2),
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'Roboto',
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  result!.code!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontFamily: 'Roboto',
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: [
                                    ElevatedButton(
                                      onPressed: isLoading
                                          ? null
                                          : _resumeScanning,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.grey[600],
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text(
                                        'Scan Again',
                                        style: TextStyle(fontFamily: 'Roboto'),
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: isLoading
                                          ? null
                                          : () => Navigator.pop(context),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(
                                          0xFF4A90E2,
                                        ),
                                        foregroundColor: Colors.white,
                                      ),
                                      child: isLoading
                                          ? const SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : const Text(
                                              'Continue',
                                              style: TextStyle(
                                                fontFamily: 'Roboto',
                                              ),
                                            ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ] else ...[
                          // Scanning status
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.7),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (_isScanning) ...[
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      color: Color(0xFF50E3C2),
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Scanning...',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      fontFamily: 'Roboto',
                                    ),
                                  ),
                                ] else ...[
                                  const Icon(
                                    Icons.pause,
                                    color: Colors.orange,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Processing...',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      fontFamily: 'Roboto',
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScannerOverlay() {
    return Container(
      decoration: BoxDecoration(color: Colors.transparent),
      child:
          Container(), // Empty container since QRView provides its own overlay
    );
  }
}

// Remove the QRScannerOverlayPainter class since we're using QRView's built-in overlay
