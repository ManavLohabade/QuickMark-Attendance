import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'dart:typed_data';
import '../../bloc/attendance/attendance_bloc.dart';
import '../../bloc/attendance/attendance_event.dart';
import '../../bloc/attendance/attendance_state.dart';
import '../../widgets/face_detection_overlay.dart';

class FaceVerificationScreen extends StatefulWidget {
  static const routeName = '/face-verification';

  const FaceVerificationScreen({super.key});

  @override
  State<FaceVerificationScreen> createState() => _FaceVerificationScreenState();
}

class _FaceVerificationScreenState extends State<FaceVerificationScreen> {
  CameraController? _cameraController;
  late List<CameraDescription> _cameras;
  bool _isCameraInitialized = false;
  bool _isProcessing = false;
  late FaceDetector _faceDetector;
  List<Face> _faces = [];
  String _instruction = 'Position your face in the center';

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _initializeFaceDetector();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isNotEmpty) {
        _cameraController = CameraController(
          _cameras.first,
          ResolutionPreset.medium,
          enableAudio: false,
        );

        await _cameraController!.initialize();

        if (mounted) {
          setState(() {
            _isCameraInitialized = true;
          });

          // Start image stream for face detection
          _cameraController!.startImageStream(_processCameraImage);
        }
      }
    } catch (e) {
      print('Error initializing camera: $e');
    }
  }

  void _initializeFaceDetector() {
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(
        enableContours: true,
        enableLandmarks: true,
        enableClassification: true,
        enableTracking: true,
      ),
    );
  }

  Future<void> _processCameraImage(CameraImage cameraImage) async {
    if (_isProcessing) return;
    _isProcessing = true;

    try {
      final inputImage = _convertCameraImage(cameraImage);
      if (inputImage != null) {
        final faces = await _faceDetector.processImage(inputImage);

        if (mounted) {
          setState(() {
            _faces = faces;
            _updateInstruction(faces);
          });
        }
      }
    } catch (e) {
      print('Error processing camera image: $e');
    } finally {
      _isProcessing = false;
    }
  }

  InputImage? _convertCameraImage(CameraImage cameraImage) {
    try {
      // Convert camera image to bytes using a simpler approach
      final bytes = Uint8List.fromList(
        cameraImage.planes.expand((plane) => plane.bytes).toList(),
      );

      final imageRotation = InputImageRotationValue.fromRawValue(
        _cameraController!.description.sensorOrientation,
      );

      if (imageRotation == null) return null;

      final inputImageFormat = InputImageFormatValue.fromRawValue(
        cameraImage.format.raw,
      );

      if (inputImageFormat == null) return null;

      final inputImageData = InputImageMetadata(
        size: Size(cameraImage.width.toDouble(), cameraImage.height.toDouble()),
        rotation: imageRotation,
        format: inputImageFormat,
        bytesPerRow: cameraImage.planes[0].bytesPerRow,
      );

      return InputImage.fromBytes(bytes: bytes, metadata: inputImageData);
    } catch (e) {
      print('Error converting camera image: $e');
      return null;
    }
  }

  void _updateInstruction(List<Face> faces) {
    if (faces.isEmpty) {
      _instruction = 'No face detected. Please look at the camera';
    } else if (faces.length > 1) {
      _instruction = 'Multiple faces detected. Only one person allowed';
    } else {
      final face = faces.first;
      final bounds = face.boundingBox;
      final imageSize = _cameraController!.value.previewSize!;

      // Check if face is centered and appropriately sized
      final centerX = imageSize.width / 2;
      final centerY = imageSize.height / 2;
      final faceCenterX = bounds.center.dx;
      final faceCenterY = bounds.center.dy;

      final horizontalDistance = (faceCenterX - centerX).abs();
      final verticalDistance = (faceCenterY - centerY).abs();

      if (horizontalDistance > 50 || verticalDistance > 50) {
        _instruction = 'Center your face in the frame';
      } else if (bounds.width < 100 || bounds.height < 100) {
        _instruction = 'Move closer to the camera';
      } else if (bounds.width > 300 || bounds.height > 300) {
        _instruction = 'Move away from the camera';
      } else {
        _instruction = 'Perfect! Tap to verify attendance';
      }
    }
  }

  Future<void> _captureAndVerifyFace() async {
    if (_faces.isEmpty || _faces.length > 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please position your face properly'),
          backgroundColor: Color(0xFFD0021B),
        ),
      );
      return;
    }

    try {
      // Stop the image stream temporarily
      await _cameraController!.stopImageStream();

      // Capture the image
      final XFile imageFile = await _cameraController!.takePicture();

      // Trigger face verification for attendance
      if (mounted) {
        context.read<AttendanceBloc>().add(
          VerifyFaceEvent(imagePath: imageFile.path),
        );
      }
    } catch (e) {
      print('Error capturing image: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to capture image'),
          backgroundColor: Color(0xFFD0021B),
        ),
      );

      // Restart image stream on error
      _cameraController!.startImageStream(_processCameraImage);
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _faceDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      appBar: AppBar(
        title: const Text(
          'Face Verification',
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
      ),
      body: BlocListener<AttendanceBloc, AttendanceState>(
        listener: (context, state) {
          if (state is AttendanceFaceVerified) {
            if (state.isVerified) {
              // Face verified successfully, navigate to QR scanner
              Navigator.pushReplacementNamed(context, '/qr-scanner');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Face verified! ${state.message}'),
                  backgroundColor: const Color(0xFF50E3C2),
                  duration: const Duration(seconds: 2),
                ),
              );
            } else {
              // Show error and restart camera
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: const Color(0xFFD0021B),
                ),
              );
              _cameraController!.startImageStream(_processCameraImage);
            }
          } else if (state is AttendanceError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(0xFFD0021B),
              ),
            );
            _cameraController!.startImageStream(_processCameraImage);
          }
        },
        child: Stack(
          children: [
            // Camera preview
            if (_isCameraInitialized)
              Positioned.fill(child: CameraPreview(_cameraController!))
            else
              const Center(
                child: CircularProgressIndicator(color: Color(0xFF4A90E2)),
              ),

            // Face detection overlay
            if (_isCameraInitialized)
              Positioned.fill(
                child: FaceDetectionOverlay(
                  faces: _faces,
                  cameraController: _cameraController!,
                ),
              ),

            // Instruction text
            Positioned(
              top: 20,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: .7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _instruction,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Roboto',
                  ),
                ),
              ),
            ),

            // Capture button
            Positioned(
              bottom: 50,
              left: 0,
              right: 0,
              child: Center(
                child: BlocBuilder<AttendanceBloc, AttendanceState>(
                  builder: (context, state) {
                    final isLoading = state is AttendanceLoading;

                    return FloatingActionButton.extended(
                      onPressed: isLoading ? null : _captureAndVerifyFace,
                      backgroundColor: _faces.length == 1
                          ? const Color(0xFF50E3C2)
                          : Colors.grey,
                      foregroundColor: Colors.white,
                      elevation: 8,
                      icon: isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Icon(Icons.camera_alt),
                      label: Text(
                        isLoading ? 'Verifying...' : 'Verify',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Roboto',
                        ),
                      ),
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
}
