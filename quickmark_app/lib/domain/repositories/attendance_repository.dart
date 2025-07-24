import '../entities/attendance.dart';

/// Abstract repository for attendance operations
abstract class AttendanceRepository {
  /// Mark attendance for the current student
  /// Returns AttendanceRecord on successful attendance marking
  Future<AttendanceRecord> markAttendance({
    required String verifySessionToken,
    required bool faceVerify,
  });

  /// Get attendance calendar for the logged-in student
  /// Returns list of attendance records filtered by optional parameters
  Future<List<AttendanceRecord>> getAttendanceCalendar({
    int? subjectId,
    String? startDate,
    String? endDate,
  });

  /// Get active attendance sessions for the student
  /// Returns list of currently active sessions
  Future<List<AttendanceSession>> getActiveSessions();

  /// Parse QR code data to extract session information
  /// Returns session data including token and session ID
  Map<String, dynamic> parseQRCode(String qrData);

  /// Upload face image for verification during attendance marking
  /// Returns verification result with confidence score
  Future<Map<String, dynamic>> uploadFaceForVerification({
    required String filePath,
  });

  /// Verify face for attendance
  /// Returns true if face verification is successful
  Future<bool> verifyFace(String imagePath);
}
