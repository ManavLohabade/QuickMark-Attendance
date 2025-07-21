import '../../domain/entities/attendance_record.dart';

/// Model for attendance record based on API responses
class AttendanceRecordModel extends AttendanceRecord {
  AttendanceRecordModel({
    required String id,
    required String sessionId,
    required String studentId,
    required String subjectId,
    required String subjectName,
    required String facultyName,
    required DateTime timestamp,
    required bool present,
    required String verificationMethod,
    String? imageUrl,
  }) : super(
         id: id,
         sessionId: sessionId,
         studentId: studentId,
         subjectId: subjectId,
         subjectName: subjectName,
         facultyName: facultyName,
         timestamp: timestamp,
         present: present,
         verificationMethod: verificationMethod,
         imageUrl: imageUrl,
       );

  /// Create AttendanceRecordModel from API JSON response
  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      id: (json['record_id'] ?? json['id'] ?? '').toString(),
      sessionId: (json['session_id'] ?? '').toString(),
      studentId: (json['student_id'] ?? '').toString(),
      subjectId: (json['subject_id'] ?? '').toString(),
      subjectName: json['subject_name'] ?? '',
      facultyName: json['faculty_name'] ?? '',
      timestamp: json['attended_at'] != null
          ? DateTime.parse(json['attended_at'])
          : DateTime.now(),
      present: _parseStatus(json['status']),
      verificationMethod: _parseVerificationMethod(json),
      imageUrl: json['image_url'],
    );
  }

  /// Helper method to parse attendance status
  static bool _parseStatus(dynamic status) {
    if (status == null) return false;
    if (status is bool) return status;
    if (status is String) {
      return status.toLowerCase() == 'present' ||
          status.toLowerCase() == 'attended' ||
          status.toLowerCase() == 'marked';
    }
    return false;
  }

  /// Helper method to parse verification method
  static String _parseVerificationMethod(Map<String, dynamic> json) {
    // Check if face verification was used
    if (json['face_verify'] == true || json['face_verified'] == true) {
      return 'face';
    }

    // Check verification method field
    if (json['verification_method'] != null) {
      return json['verification_method'];
    }

    // Default verification method
    return 'manual';
  }

  /// Convert to JSON for API requests
  Map<String, dynamic> toJson() {
    return {
      'record_id': id,
      'session_id': sessionId,
      'student_id': studentId,
      'subject_id': subjectId,
      'subject_name': subjectName,
      'faculty_name': facultyName,
      'attended_at': timestamp.toIso8601String(),
      'status': present ? 'present' : 'absent',
      'verification_method': verificationMethod,
      if (imageUrl != null) 'image_url': imageUrl,
    };
  }

  /// Create from attendance entity
  factory AttendanceRecordModel.fromEntity(AttendanceRecord record) {
    return AttendanceRecordModel(
      id: record.id,
      sessionId: record.sessionId,
      studentId: record.studentId,
      subjectId: record.subjectId,
      subjectName: record.subjectName,
      facultyName: record.facultyName,
      timestamp: record.timestamp,
      present: record.present,
      verificationMethod: record.verificationMethod,
      imageUrl: record.imageUrl,
    );
  }

  @override
  String toString() {
    return 'AttendanceRecordModel(id: $id, sessionId: $sessionId, studentId: $studentId, status: ${present ? "present" : "absent"}, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AttendanceRecordModel &&
        other.id == id &&
        other.sessionId == sessionId &&
        other.studentId == studentId &&
        other.timestamp == timestamp;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        sessionId.hashCode ^
        studentId.hashCode ^
        timestamp.hashCode;
  }
}
