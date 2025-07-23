import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
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
  CameraImage? _currentCameraImage; // Store current camera image for processing

  // ML Kit
  late FaceDetector _faceDetector;

  // TFLite
  Interpreter? _interpreter;
  bool _isModelLoaded = false;

  // Face registration state
  bool _isProcessing = false;
  String? _errorMessage;

  // Image conversion utilities
  img.Image? convertCameraImage(CameraImage cameraImage) {
    if (cameraImage.format.group == ImageFormatGroup.yuv420) {
      return _convertYUV420(cameraImage);
    } else if (cameraImage.format.group == ImageFormatGroup.bgra8888) {
      return _convertBGRA8888(cameraImage);
    }
    return null;
  }

  img.Image _convertBGRA8888(CameraImage image) {
    return img.Image.fromBytes(
      width: image.width,
      height: image.height,
      bytes: image.planes[0].bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
  }

  img.Image _convertYUV420(CameraImage image) {
    final int width = image.width;
    final int height = image.height;
    final int uvRowStride = image.planes[1].bytesPerRow;
    final int uvPixelStride = image.planes[1].bytesPerPixel!;
    final imageBytes = Uint8List(width * height * 3);

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final int uvIndex =
            uvPixelStride * (x / 2).floor() + uvRowStride * (y / 2).floor();
        final int index = y * width + x;

        final yp = image.planes[0].bytes[index];
        final up = image.planes[1].bytes[uvIndex];
        final vp = image.planes[2].bytes[uvIndex];

        int r = (yp + vp * 1436 / 1024 - 179).round().clamp(0, 255);
        int g = (yp - up * 46549 / 131072 + 44 - vp * 93604 / 131072 + 91)
            .round()
            .clamp(0, 255);
        int b = (yp + up * 1814 / 1024 - 227).round().clamp(0, 255);

        imageBytes[index * 3] = r.toUnsigned(8);
        imageBytes[index * 3 + 1] = g.toUnsigned(8);
        imageBytes[index * 3 + 2] = b.toUnsigned(8);
      }
    }
    return img.Image.fromBytes(
      width: width,
      height: height,
      bytes: imageBytes.buffer,
      order: img.ChannelOrder.rgb,
    );
  }

  // Generate face embedding using the new processing logic
  Float32List? getFaceEmbedding(
    CameraImage cameraImage,
    Face face,
    Interpreter interpreter,
  ) {
    try {
      // 1. Convert CameraImage to a standard Image format
      img.Image? convertedImage = convertCameraImage(cameraImage);
      if (convertedImage == null) return null;

      // 2. Crop the image to the detected face
      // The bounding box from google_ml_kit gives us the coordinates.
      double x = face.boundingBox.left;
      double y = face.boundingBox.top;
      double w = face.boundingBox.width;
      double h = face.boundingBox.height;

      // Use the image package to crop the image
      img.Image croppedImage = img.copyCrop(
        convertedImage,
        x: x.round(),
        y: y.round(),
        width: w.round(),
        height: h.round(),
      );

      // 3. Resize the image to the model's input size (e.g., 112x112 for MobileFaceNet)
      img.Image resizedImage = img.copyResize(
        croppedImage,
        width: 112,
        height: 112,
      );

      // 4. Normalize the image and convert to a Float32List
      // This is the crucial step that replaces the broken internal logic.
      Float32List imageAsList = Float32List(1 * 112 * 112 * 3);
      int i = 0;
      for (final pixel in resizedImage) {
        // Normalize pixel values to be between -1 and 1
        imageAsList[i++] = (pixel.r - 127.5) / 127.5;
        imageAsList[i++] = (pixel.g - 127.5) / 127.5;
        imageAsList[i++] = (pixel.b - 127.5) / 127.5;
      }

      // Reshape the list to the format the model expects: [1, 112, 112, 3]
      final input = imageAsList.reshape([1, 112, 112, 3]);

      // The output will have a shape like [1, 192] (for MobileFaceNet)
      final output = List.filled(1 * 192, 0.0).reshape([1, 192]);

      // 5. Run the interpreter
      interpreter.run(input, output);

      // 6. Return the embedding
      return output[0] as Float32List;
    } catch (e) {
      print('Error generating face embedding: $e');
      return null;
    }
  }

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
      _interpreter = await Interpreter.fromAsset('assets/mobilefacenet.tflite');
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
    _currentCameraImage = cameraImage; // Store for face processing

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
    if (!_isFaceDetected ||
        _detectedFaces.isEmpty ||
        _isProcessing ||
        _currentCameraImage == null ||
        _interpreter == null) {
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      // Use the first detected face
      final Face face = _detectedFaces.first;

      // Generate face embedding using our new processing logic
      final Float32List? embedding = getFaceEmbedding(
        _currentCameraImage!,
        face,
        _interpreter!,
      );

      if (embedding != null) {
        // For now, we'll still capture the image file for the UI/storage
        final XFile imageFile = await _cameraController!.takePicture();

        // Check if the widget is still mounted before using context
        if (mounted) {
          // Register face using FaceBloc - you might want to modify FaceBloc to accept embeddings
          context.read<FaceBloc>().add(
            RegisterFaceEvent(faceImageUrl: imageFile.path),
          );
        }

        print(
          'Face embedding generated successfully: ${embedding.length} features',
        );
      } else {
        setState(() {
          _errorMessage = 'Failed to generate face embedding';
          _isProcessing = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error processing face: $e';
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
