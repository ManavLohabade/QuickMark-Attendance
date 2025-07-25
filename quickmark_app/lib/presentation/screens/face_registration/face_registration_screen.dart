import 'dart:typed_data';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
// import 'package:image_picker/image_picker.dart';
import '../../bloc/face/face_bloc.dart';
import '../../bloc/face/face_state.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/auth/auth_event.dart' as auth_events;
import '../../widgets/app_error_widget.dart';
import '../../widgets/face_detection_overlay.dart';
import '../../../main.dart';

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
  bool _modelsLoaded = false;

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
      setState(() {
        _errorMessage = 'Failed to load face recognition models: $e';
      });
    }
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
        !_modelsLoaded) {
      return;
    }

    if (!_modelsLoaded) {
      setState(() {
        _errorMessage = 'Models not loaded yet.';
        _isProcessing = false;
      });
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      // Capture the image file first
      final XFile imageFile = await _cameraController!.takePicture();

      // Use the working _processImage method from home_screen.dart
      final List<double>? embedding = await _processImage(imageFile);

      if (embedding != null && mounted) {
        // Convert embedding to JSON string for storage
        final String embeddingJson = jsonEncode(embedding);

        // Save embedding locally using a custom method that we'll add
        final success = await _saveFaceEmbeddingLocally(embeddingJson);

        if (success) {
          // Update local user data to mark face as registered
          await _updateLocalFaceRegistrationStatus(true);

          // Show success message
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Face registered successfully!'),
                backgroundColor: const Color(0xFF50E3C2),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            );

            // Refresh auth status to update face registration flag
            context.read<AuthBloc>().add(
              const auth_events.CheckAuthStatusEvent(),
            );

            Navigator.pop(context);
          }
        } else {
          setState(() {
            _errorMessage = 'Failed to save face data locally';
            _isProcessing = false;
          });
        }

        print(
          'Face embedding generated successfully: ${embedding.length} features',
        );
      } else {
        setState(() {
          _errorMessage =
              'Failed to generate face embedding - no face detected in captured image';
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

  /// Save face embedding locally using SharedPreferences
  Future<bool> _saveFaceEmbeddingLocally(String embeddingJson) async {
    try {
      // Access the local data source through the MyApp widget
      final localDataSource = context
          .findAncestorWidgetOfExactType<MyApp>()
          ?.localDataSource;
      if (localDataSource == null) return false;

      return await localDataSource.saveFaceEmbedding(embeddingJson);
    } catch (e) {
      print('Error saving face embedding locally: $e');
      return false;
    }
  }

  /// Update local user data to mark face as registered
  Future<bool> _updateLocalFaceRegistrationStatus(bool isRegistered) async {
    try {
      // Access the local data source through the MyApp widget
      final localDataSource = context
          .findAncestorWidgetOfExactType<MyApp>()
          ?.localDataSource;
      if (localDataSource == null) return false;

      // Get current user data
      final userData = localDataSource.getUserData();
      if (userData == null) return false;

      // Update the face registration status
      userData['is_face_registered'] = isRegistered;

      // Save the updated user data
      return await localDataSource.saveUserData(userData);
    } catch (e) {
      print('Error updating local face registration status: $e');
      return false;
    }
  }

  void _retryInitialization() {
    setState(() {
      _errorMessage = null;
    });
    _initializeCamera();
    _loadModels();
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
          // We're now handling face registration locally, so this listener
          // is mainly for potential error states from other face operations
          if (state is FaceError) {
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

          if (!_isCameraInitialized || !_modelsLoaded) {
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
            gradient: LinearGradient(
              colors: [Color(0xFF4A90E2), Color(0xFF2A56C6)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Column(
            children: [
              const Icon(Icons.face, size: 32, color: Colors.white),
              const SizedBox(height: 12),
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
                  vertical: 12,
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
                      fontWeight: FontWeight.w600,
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
