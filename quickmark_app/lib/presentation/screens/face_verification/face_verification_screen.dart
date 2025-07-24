import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'dart:typed_data';
import '../../bloc/attendance/attendance_bloc.dart';
import '../../bloc/attendance/attendance_event.dart';
import '../../bloc/attendance/attendance_state.dart';
import '../../widgets/face_detection_overlay.dart';
import '../../widgets/app_error_widget.dart';

class FaceVerificationScreen extends StatefulWidget {
  static const routeName = '/face-verification';

  const FaceVerificationScreen({super.key});

  @override
  State<FaceVerificationScreen> createState() => _FaceVerificationScreenState();
}

class _FaceVerificationScreenState extends State<FaceVerificationScreen>
    with WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCameraInitialized = false;
  bool _isDetecting = false;
  bool _isFaceDetected = false;
  List<Face> _detectedFaces = [];
  bool _isProcessing = false;
  String? _errorMessage;

  // ML Kit
  late FaceDetector _faceDetector;

  // TFLite
  Interpreter? _interpreter;
  bool _modelsLoaded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCamera();
    _loadModels();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _stopCameraStream();
    _cameraController?.dispose();
    _faceDetector.close();
    _interpreter?.close();
    super.dispose();
  }

  Future<void> _stopCameraStream() async {
    try {
      // Stop image stream first to prevent buffer access issues
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        await _cameraController!.stopImageStream();
      }
    } catch (e) {
      print('Error stopping image stream during dispose: $e');
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final cameraController = _cameraController;
    if (cameraController == null || !cameraController.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras!.isEmpty) {
        setState(() {
          _errorMessage = 'No cameras available';
        });
        return;
      }

      // Use front camera for face verification (selfie-style)
      final frontCamera = _cameras!.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.front,
        orElse: () => _cameras!.first,
      );

      _cameraController = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await _cameraController!.initialize();
      await _cameraController!.startImageStream(_processCameraImage);

      setState(() {
        _isCameraInitialized = true;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to initialize camera: $e';
      });
    }
  }

  Future<void> _loadModels() async {
    try {
      // Load ML Kit face detector
      _faceDetector = FaceDetector(
        options: FaceDetectorOptions(
          enableContours: false,
          enableLandmarks: false,
          performanceMode: FaceDetectorMode.accurate,
        ),
      );
      // Load MobileFaceNet TFLite model
      final interpreter = await Interpreter.fromAsset(
        'assets/mobilefacenet.tflite',
      );
      setState(() {
        _interpreter = interpreter;
        _modelsLoaded = true;
      });
    } catch (e) {
      print('Error loading models: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load face recognition models: $e'),
            backgroundColor: const Color(0xFFD0021B),
          ),
        );
      }
    }
  }

  // Working methods from home_screen.dart
  Future<List<double>?> _processImage(XFile imageFile) async {
    // 1. Load image using image package
    final bytes = await imageFile.readAsBytes();
    final img.Image? original = img.decodeImage(bytes);
    if (original == null) return null;
    // 2. Detect face
    final inputImage = InputImage.fromFilePath(imageFile.path);
    final faces = await _faceDetector.processImage(inputImage);
    if (faces.isEmpty) return null;
    final face = faces.first;
    final rect = face.boundingBox;
    // 3. Crop and resize face region to 112x112 for MobileFaceNet
    final left = rect.left.round().clamp(0, original.width - 1);
    final top = rect.top.round().clamp(0, original.height - 1);
    final right = rect.right.round().clamp(0, original.width);
    final bottom = rect.bottom.round().clamp(0, original.height);
    final faceCrop = img.copyCrop(
      original,
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    );
    final faceResized = img.copyResize(faceCrop, width: 112, height: 112);
    // 4. Normalize to [-1, 1] and convert to Float32List
    final imageAsFloat32List = _imageToFloat32List(faceResized);
    // 5. Run inference
    if (_interpreter == null) return null;

    // Reshape the flat Float32List into a 4D list [1, 112, 112, 3]
    // to match the model's expected input shape.
    List<List<List<List<double>>>> inputTensorValue = List.generate(
      1, // Batch size
      (b) => List.generate(
        112, // Height
        (y) => List.generate(
          112, // Width
          (x) => List.generate(3, (c) {
            // Channels (R,G,B)
            int index = (y * 112 * 3) + (x * 3) + c;
            return imageAsFloat32List[index];
          }),
        ),
      ),
    );

    var output = List.filled(1 * 192, 0.0).reshape([1, 192]);
    _interpreter!.run(inputTensorValue, output); // Pass the 4D list
    // 6. Return embedding as List<double>
    return List<double>.from(output[0]);
  }

  Float32List _imageToFloat32List(img.Image image) {
    final Float32List input = Float32List(1 * 112 * 112 * 3);
    int index = 0;
    for (int y = 0; y < 112; y++) {
      for (int x = 0; x < 112; x++) {
        final pixel = image.getPixel(x, y);
        input[index++] = (pixel.r - 127.5) / 127.5;
        input[index++] = (pixel.g - 127.5) / 127.5;
        input[index++] = (pixel.b - 127.5) / 127.5;
      }
    }
    return input;
  }

  Future<void> _processCameraImage(CameraImage cameraImage) async {
    if (_isDetecting || !_modelsLoaded || !mounted) return;

    _isDetecting = true;

    try {
      // Additional safety check for disposed controller
      if (_cameraController == null ||
          !_cameraController!.value.isInitialized) {
        return;
      }

      final inputImage = _convertCameraImageToInputImage(cameraImage);
      final faces = await _faceDetector.processImage(inputImage);

      if (mounted) {
        setState(() {
          _detectedFaces = faces;
          _isFaceDetected = faces.isNotEmpty;
        });
      }
    } catch (e) {
      print('Error processing camera image: $e');
      // Stop image stream if there's a persistent error
      if (mounted &&
          _cameraController != null &&
          _cameraController!.value.isInitialized) {
        try {
          await _cameraController!.stopImageStream();
        } catch (stopError) {
          print('Error stopping image stream: $stopError');
        }
      }
    } finally {
      if (mounted) {
        _isDetecting = false;
      }
    }
  }

  InputImage _convertCameraImageToInputImage(CameraImage cameraImage) {
    // Safety check for controller and mounted state
    if (!mounted ||
        _cameraController == null ||
        !_cameraController!.value.isInitialized) {
      throw Exception('Camera controller is not available');
    }

    final allBytes = cameraImage.planes
        .map((plane) => plane.bytes)
        .expand((bytes) => bytes)
        .toList();

    final imageSize = Size(
      cameraImage.width.toDouble(),
      cameraImage.height.toDouble(),
    );

    final camera = _cameraController!.description;
    final imageRotation = InputImageRotationValue.fromRawValue(
      camera.sensorOrientation,
    );

    final inputImageFormat = InputImageFormatValue.fromRawValue(
      cameraImage.format.raw,
    );

    if (inputImageFormat == null || imageRotation == null) {
      throw Exception('Failed to convert camera image format');
    }

    final inputImageData = InputImageMetadata(
      size: imageSize,
      rotation: imageRotation,
      format: inputImageFormat,
      bytesPerRow: cameraImage.planes[0].bytesPerRow,
    );

    return InputImage.fromBytes(
      bytes: Uint8List.fromList(allBytes),
      metadata: inputImageData,
    );
  }

  Future<void> _captureAndVerifyFace() async {
    if (!_isFaceDetected || _detectedFaces.length != 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please position your face properly'),
          backgroundColor: Color(0xFFD0021B),
        ),
      );
      return;
    }

    if (!_modelsLoaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Models not loaded yet.'),
          backgroundColor: Color(0xFFD0021B),
        ),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      // Stop the image stream temporarily
      await _cameraController!.stopImageStream();

      // Capture the image
      final XFile imageFile = await _cameraController!.takePicture();

      // Test the embedding generation using the working method
      final List<double>? embedding = await _processImage(imageFile);

      if (embedding != null) {
        print(
          'Face embedding generated successfully for verification: ${embedding.length} features',
        );

        // Trigger face verification for attendance with the image path
        // (The AttendanceBloc will handle the verification logic)
        if (mounted) {
          context.read<AttendanceBloc>().add(
            VerifyFaceEvent(imagePath: imageFile.path),
          );
        }
      } else {
        // Failed to generate embedding
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to process face for verification'),
            backgroundColor: Color(0xFFD0021B),
          ),
        );
        _restartCameraStream();
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
      _restartCameraStream();
    }
  }

  Future<void> _restartCameraStream() async {
    if (_cameraController != null &&
        _cameraController!.value.isInitialized &&
        mounted) {
      try {
        await _cameraController!.stopImageStream();
        await Future.delayed(const Duration(milliseconds: 100)); // Small delay
        _cameraController!.startImageStream(_processCameraImage);
        setState(() {
          _isProcessing = false;
        });
      } catch (e) {
        print('Error restarting camera stream: $e');
      }
    }
  }

  void _retryInitialization() {
    setState(() {
      _errorMessage = null;
      _isCameraInitialized = false;
      _modelsLoaded = false;
    });
    _initializeCamera();
    _loadModels();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
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
        elevation: 2,
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
              _restartCameraStream();
            }
          } else if (state is AttendanceError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(0xFFD0021B),
              ),
            );
            _restartCameraStream();
          }
        },
        child: Builder(
          builder: (context) {
            if (_errorMessage != null) {
              return _buildErrorView();
            }

            if (!_isCameraInitialized || !_modelsLoaded) {
              return _buildLoadingView();
            }

            return _buildCameraView();
          },
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: AppErrorWidget(
          message: _errorMessage!,
          onRetry: _retryInitialization,
        ),
      ),
    );
  }

  Widget _buildLoadingView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Color(0xFF4A90E2)),
          SizedBox(height: 16),
          Text(
            'Initializing camera and face detection...',
            style: TextStyle(
              fontSize: 16,
              color: Color(0xFF333333),
              fontFamily: 'Roboto',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCameraView() {
    return Column(
      children: [
        // Instructions
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          decoration: const BoxDecoration(color: Color(0xFF4A90E2)),
          child: Column(
            children: [
              const Icon(Icons.face, size: 32, color: Colors.white),
              const SizedBox(height: 8),
              const Text(
                'Position your face in the frame',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontFamily: 'Roboto',
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _isFaceDetected
                    ? 'Face detected! Tap verify to continue'
                    : 'Make sure your face is clearly visible',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ),
        ),

        // Camera Preview
        Expanded(
          child: Stack(
            children: [
              // Camera Preview
              Container(
                width: double.infinity,
                height: double.infinity,
                color: Colors.black,
                child: _cameraController != null
                    ? CameraPreview(_cameraController!)
                    : const Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFF4A90E2),
                        ),
                      ),
              ),

              // Face Detection Overlay
              if (_isFaceDetected)
                FaceDetectionOverlay(
                  faces: _detectedFaces,
                  cameraController: _cameraController!,
                ),

              // Processing Overlay
              if (_isProcessing)
                Container(
                  color: const Color(0x80000000),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: Color(0xFF50E3C2)),
                        SizedBox(height: 16),
                        Text(
                          'Verifying face...',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white,
                            fontFamily: 'Roboto',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),

        // Bottom Controls
        Container(
          padding: const EdgeInsets.all(24.0),
          decoration: const BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Color(0x1A000000),
                blurRadius: 8,
                offset: Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Face Detection Status
              Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 8,
                  horizontal: 16,
                ),
                decoration: BoxDecoration(
                  color: _isFaceDetected
                      ? const Color(0xFF50E3C2).withValues(alpha: 0.1)
                      : const Color(0xFFD0021B).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _isFaceDetected
                        ? const Color(0xFF50E3C2)
                        : const Color(0xFFD0021B),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isFaceDetected ? Icons.check_circle : Icons.warning,
                      color: _isFaceDetected
                          ? const Color(0xFF50E3C2)
                          : const Color(0xFFD0021B),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _isFaceDetected ? 'Face Detected' : 'No Face Detected',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: _isFaceDetected
                            ? const Color(0xFF50E3C2)
                            : const Color(0xFFD0021B),
                        fontFamily: 'Roboto',
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Verify Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_isFaceDetected && !_isProcessing)
                      ? _captureAndVerifyFace
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4A90E2),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: 12,
                      horizontal: 24,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 2,
                    textStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                      letterSpacing: 1.25,
                    ),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : const Text('VERIFY FACE'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
