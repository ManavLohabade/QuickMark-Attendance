import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'dart:math';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import '../../domain/repositories/attendance_repository.dart';
import '../../domain/entities/attendance.dart';
import '../datasources/remote/remote_data_source.dart';
import '../datasources/local/local_data_source.dart';
import '../models/models.dart';

class AttendanceRepositoryImpl implements AttendanceRepository {
  final RemoteDataSource _remoteDataSource;
  final LocalDataSource _localDataSource;

  AttendanceRepositoryImpl({
    required RemoteDataSource remoteDataSource,
    required LocalDataSource localDataSource,
  }) : _remoteDataSource = remoteDataSource,
       _localDataSource = localDataSource;

  @override
  Future<AttendanceRecord> markAttendance({
    required String verifySessionToken,
    required bool faceVerify,
  }) async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _remoteDataSource.markAttendance(
        token: token,
        verifySessionToken: verifySessionToken,
        faceVerify: faceVerify,
      );

      final markResponse = AttendanceMarkResponseModel.fromJson(response);
      return markResponse.record;
    } catch (e) {
      throw Exception('Failed to mark attendance: ${e.toString()}');
    }
  }

  @override
  Future<List<AttendanceRecord>> getAttendanceCalendar({
    int? subjectId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _remoteDataSource.getAttendanceCalendar(
        token: token,
        subjectId: subjectId,
        startDate: startDate,
        endDate: endDate,
      );

      // Convert response to AttendanceRecord models
      return response
          .map((record) => AttendanceRecordModel.fromJson(record))
          .toList();
    } catch (e) {
      throw Exception('Failed to get attendance calendar: ${e.toString()}');
    }
  }

  @override
  Future<List<AttendanceSession>> getActiveSessions() async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _remoteDataSource.getActiveSessions(token: token);

      // Convert response to AttendanceSession models
      return response
          .map((session) => AttendanceSessionModel.fromJson(session))
          .toList();
    } catch (e) {
      throw Exception('Failed to get active sessions: ${e.toString()}');
    }
  }

  @override
  Map<String, dynamic> parseQRCode(String qrData) {
    try {
      return _remoteDataSource.parseQRCode(qrData);
    } catch (e) {
      throw Exception('Failed to parse QR code: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>> uploadFaceForVerification({
    required String filePath,
  }) async {
    try {
      final token = _localDataSource.getJwtToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _remoteDataSource.uploadFaceForVerification(
        token: token,
        filePath: filePath,
      );

      return response;
    } catch (e) {
      throw Exception(
        'Failed to upload face for verification: ${e.toString()}',
      );
    }
  }

  @override
  Future<bool> verifyFace(String imagePath) async {
    try {
      // Get stored face embedding for comparison
      final storedEmbeddingJson = _localDataSource.getFaceEmbedding();
      if (storedEmbeddingJson == null || storedEmbeddingJson.isEmpty) {
        throw Exception('No face data registered for verification');
      }

      // Parse stored embedding
      final List<dynamic> storedEmbeddingDynamic = jsonDecode(
        storedEmbeddingJson,
      );
      final List<double> storedEmbedding = storedEmbeddingDynamic
          .cast<double>();

      // Generate embedding for the verification image using the same process
      final List<double>? verificationEmbedding =
          await _generateEmbeddingFromImage(imagePath);

      if (verificationEmbedding == null) {
        throw Exception('Failed to generate embedding from verification image');
      }

      // Calculate cosine similarity between embeddings
      final similarity = _calculateCosineSimilarity(
        storedEmbedding,
        verificationEmbedding,
      );

      // Use a threshold for face verification (typically 0.6-0.8 for MobileFaceNet)
      const double threshold = 0.7;
      final bool isVerified = similarity >= threshold;

      print(
        'Face verification similarity: $similarity, threshold: $threshold, verified: $isVerified',
      );

      return isVerified;
    } catch (e) {
      print('Face verification failed: $e');
      throw Exception('Face verification failed: ${e.toString()}');
    }
  }

  /// Generate face embedding from image path (reused from registration logic)
  Future<List<double>?> _generateEmbeddingFromImage(String imagePath) async {
    try {
      // Load models
      final faceDetector = FaceDetector(
        options: FaceDetectorOptions(
          enableContours: false,
          enableLandmarks: false,
          performanceMode: FaceDetectorMode.accurate,
        ),
      );

      final interpreter = await Interpreter.fromAsset(
        'assets/mobilefacenet.tflite',
      );

      // Load and process image (same logic as in face registration)
      final bytes = await File(imagePath).readAsBytes();
      final img.Image? original = img.decodeImage(bytes);
      if (original == null) return null;

      // Detect face
      final inputImage = InputImage.fromFilePath(imagePath);
      final faces = await faceDetector.processImage(inputImage);
      if (faces.isEmpty) return null;

      final face = faces.first;
      final rect = face.boundingBox;

      // Crop and resize face (same as registration)
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

      // Normalize and convert to tensor
      final Float32List input = Float32List(1 * 112 * 112 * 3);
      int index = 0;
      for (int y = 0; y < 112; y++) {
        for (int x = 0; x < 112; x++) {
          final pixel = faceResized.getPixel(x, y);
          input[index++] = (pixel.r - 127.5) / 127.5;
          input[index++] = (pixel.g - 127.5) / 127.5;
          input[index++] = (pixel.b - 127.5) / 127.5;
        }
      }

      // Reshape to 4D tensor
      List<List<List<List<double>>>> inputTensorValue = List.generate(
        1,
        (b) => List.generate(
          112,
          (y) => List.generate(
            112,
            (x) => List.generate(3, (c) {
              int idx = (y * 112 * 3) + (x * 3) + c;
              return input[idx];
            }),
          ),
        ),
      );

      // Run inference
      var output = List.filled(1 * 192, 0.0).reshape([1, 192]);
      interpreter.run(inputTensorValue, output);

      // Cleanup
      faceDetector.close();
      interpreter.close();

      return List<double>.from(output[0]);
    } catch (e) {
      print('Error generating embedding from image: $e');
      return null;
    }
  }

  /// Calculate cosine similarity between two embeddings
  double _calculateCosineSimilarity(
    List<double> embedding1,
    List<double> embedding2,
  ) {
    if (embedding1.length != embedding2.length) {
      throw Exception('Embeddings must have same length');
    }

    double dotProduct = 0.0;
    double norm1 = 0.0;
    double norm2 = 0.0;

    for (int i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 == 0.0 || norm2 == 0.0) {
      return 0.0;
    }

    return dotProduct / (sqrt(norm1) * sqrt(norm2));
  }
}
