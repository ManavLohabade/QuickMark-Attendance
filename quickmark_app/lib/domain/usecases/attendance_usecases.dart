import '../repositories/attendance_repository.dart';
import '../entities/attendance.dart';

class MarkAttendanceUseCase {
  final AttendanceRepository repository;

  MarkAttendanceUseCase(this.repository);

  Future<AttendanceRecord> execute({
    required String verifySessionToken,
    required bool faceVerify,
  }) {
    return repository.markAttendance(
      verifySessionToken: verifySessionToken,
      faceVerify: faceVerify,
    );
  }
}

class GetAttendanceCalendarUseCase {
  final AttendanceRepository repository;

  GetAttendanceCalendarUseCase(this.repository);

  Future<List<AttendanceRecord>> execute({
    int? subjectId,
    String? startDate,
    String? endDate,
  }) {
    return repository.getAttendanceCalendar(
      subjectId: subjectId,
      startDate: startDate,
      endDate: endDate,
    );
  }
}

class GetActiveSessionsUseCase {
  final AttendanceRepository repository;

  GetActiveSessionsUseCase(this.repository);

  Future<List<AttendanceSession>> execute() {
    return repository.getActiveSessions();
  }
}

class ParseQRCodeUseCase {
  final AttendanceRepository repository;

  ParseQRCodeUseCase(this.repository);

  Map<String, dynamic> execute(String qrData) {
    return repository.parseQRCode(qrData);
  }
}

class UploadFaceForVerificationUseCase {
  final AttendanceRepository repository;

  UploadFaceForVerificationUseCase(this.repository);

  Future<Map<String, dynamic>> execute({required String filePath}) {
    return repository.uploadFaceForVerification(filePath: filePath);
  }
}

class VerifyFaceUseCase {
  final AttendanceRepository repository;

  VerifyFaceUseCase(this.repository);

  Future<bool> execute(String imagePath) {
    return repository.verifyFace(imagePath);
  }
}
