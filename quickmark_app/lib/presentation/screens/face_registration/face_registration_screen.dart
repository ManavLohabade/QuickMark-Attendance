import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:google_ml_kit/google_ml_kit.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import '../../bloc/face/face_bloc.dart';
import '../../bloc/face/face_event.dart';
import '../../bloc/face/face_state.dart';
import '../../widgets/app_error_widget.dart';
import '../../widgets/face_detection_overlay.dart';

class FaceRegistrationScreen extends StatefulWidget {
  static const routeName = '/face-registration';

  const FaceRegistrationScreen({super.key});

  @override
  State<FaceRegistrationScreen> createState() => _FaceRegistrationScreenState();
}

class _FaceRegistrationScreenState extends State<FaceRegistrationScreen>
    with WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCameraInitialized = false;
  bool _isDetecting = false;
  bool _isFaceDetected = false;
  List<Face> _detectedFaces = [];

  // ML Kit
  late FaceDetector _faceDetector;

  // TFLite
  Interpreter? _interpreter;
  bool _isModelLoaded = false;

  // Face registration state
  bool _isProcessing = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCamera();
    _initializeFaceDetector();
    _loadTFLiteModel();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _faceDetector.close();
    _interpreter?.close();
    super.dispose();
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

      // Use front camera for face registration
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

  void _initializeFaceDetector() {
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(
        enableClassification: false,
        enableLandmarks: true,
        enableContours: true,
        enableTracking: false,
        minFaceSize: 0.1,
        performanceMode: FaceDetectorMode.accurate,
      ),
    );
  }

  Future<void> _loadTFLiteModel() async {
    try {
      _interpreter = await Interpreter.fromAsset('mobilefacenet.tflite');
      setState(() {
        _isModelLoaded = true;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load face recognition model: $e';
      });
    }
  }

  Future<void> _processCameraImage(CameraImage cameraImage) async {
    if (_isDetecting || !_isModelLoaded) return;

    _isDetecting = true;

    try {
      final inputImage = _convertCameraImageToInputImage(cameraImage);
      final faces = await _faceDetector.processImage(inputImage);

      setState(() {
        _detectedFaces = faces;
        _isFaceDetected = faces.isNotEmpty;
      });
    } catch (e) {
      print('Error processing camera image: $e');
    } finally {
      _isDetecting = false;
    }
  }

  InputImage _convertCameraImageToInputImage(CameraImage cameraImage) {
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

    return InputImage.fromBytes(
      bytes: Uint8List.fromList(allBytes),
      metadata: InputImageMetadata(
        size: imageSize,
        rotation: imageRotation ?? InputImageRotation.rotation0deg,
        format: inputImageFormat ?? InputImageFormat.nv21,
        bytesPerRow: cameraImage.planes[0].bytesPerRow,
      ),
    );
  }

  Future<void> _captureAndProcessFace() async {
    if (!_isFaceDetected || _detectedFaces.isEmpty || _isProcessing) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      // Capture image
      final XFile imageFile = await _cameraController!.takePicture();

      // Register face using FaceBloc
      context.read<FaceBloc>().add(
        RegisterFaceEvent(faceImageUrl: imageFile.path),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Error capturing face: $e';
        _isProcessing = false;
      });
    }
  }

  void _retryInitialization() {
    setState(() {
      _errorMessage = null;
    });
    _initializeCamera();
    _loadTFLiteModel();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(
        0xFFF5F5F5,
      ), // backgroundColor from design.json
      appBar: AppBar(
        title: const Text(
          'Face Registration',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(
          0xFF4A90E2,
        ), // primaryColor from design.json
        elevation: 2,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: BlocConsumer<FaceBloc, FaceState>(
        listener: (context, state) {
          if (state is FaceRegistered) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(
                  0xFF50E3C2,
                ), // accentColor from design.json
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            );
            Navigator.pop(context);
          } else if (state is FaceError) {
            setState(() {
              _errorMessage = state.message;
              _isProcessing = false;
            });
          }
        },
        builder: (context, state) {
          if (_errorMessage != null) {
            return _buildErrorView();
          }

          if (!_isCameraInitialized || !_isModelLoaded) {
            return _buildLoadingView();
          }

          return _buildCameraView();
        },
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
          CircularProgressIndicator(
            color: Color(0xFF4A90E2), // primaryColor from design.json
          ),
          SizedBox(height: 16),
          Text(
            'Initializing camera and face detection...',
            style: TextStyle(
              fontSize: 16,
              color: Color(0xFF333333), // textColor from design.json
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
          decoration: const BoxDecoration(
            color: Color(0xFF4A90E2), // primaryColor from design.json
          ),
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
                    ? 'Face detected! Tap capture to register'
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
                  color: const Color(0x80000000), // Semi-transparent overlay
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: Color(
                            0xFF50E3C2,
                          ), // accentColor from design.json
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Processing face...',
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
                      ? const Color(0xFF50E3C2).withValues(
                          alpha: 0.1,
                        ) // accentColor
                      : const Color(
                          0xFFD0021B,
                        ).withValues(alpha: 0.1), // errorColor
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

              // Capture Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_isFaceDetected && !_isProcessing)
                      ? _captureAndProcessFace
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(
                      0xFF4A90E2,
                    ), // primaryColor from design.json
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: 12, // padding from design.json
                      horizontal: 24,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(
                        8,
                      ), // borderRadius from design.json
                    ),
                    elevation: 2, // elevation from design.json
                    textStyle: const TextStyle(
                      fontSize: 18, // button fontSize from design.json
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                      letterSpacing: 1.25, // letterSpacing from design.json
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
                      : const Text('CAPTURE FACE'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
