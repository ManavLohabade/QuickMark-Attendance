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
      final storedEmbedding = _localDataSource.getFaceEmbedding();
      if (storedEmbedding == null) {
        throw Exception('No face data registered for verification');
      }

      // Upload face for verification and compare
      final verificationResult = await uploadFaceForVerification(
        filePath: imagePath,
      );

      // Check if verification was successful
      return verificationResult['verified'] == true;
    } catch (e) {
      throw Exception('Face verification failed: ${e.toString()}');
    }
  }
}
