import '../../domain/entities/attendance.dart';

class AttendanceSessionModel extends AttendanceSession {
  AttendanceSessionModel({
    required String sessionId,
    required String subjectName,
    required String subjectId,
    required String facultyName,
    required DateTime sessionDate,
    required DateTime startTime,
    DateTime? endTime,
    required String status,
    String? qrCodeData,
  }) : super(
         sessionId: sessionId,
         subjectName: subjectName,
         subjectId: subjectId,
         facultyName: facultyName,
         sessionDate: sessionDate,
         startTime: startTime,
         endTime: endTime,
         status: status,
         qrCodeData: qrCodeData,
       );

  factory AttendanceSessionModel.fromJson(Map<String, dynamic> json) {
    return AttendanceSessionModel(
      sessionId: json['session_id'] ?? '',
      subjectName: json['subject_name'] ?? '',
      subjectId: json['subject_id'] ?? '',
      facultyName: json['faculty_name'] ?? '',
      sessionDate: DateTime.parse(json['session_date']),
      startTime: DateTime.parse(json['start_time']),
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : null,
      status: json['status'] ?? 'unknown',
      qrCodeData: json['qr_code_data'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'session_id': sessionId,
      'subject_name': subjectName,
      'subject_id': subjectId,
      'faculty_name': facultyName,
      'session_date': sessionDate.toIso8601String(),
      'start_time': startTime.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'status': status,
      'qr_code_data': qrCodeData,
    };
  }

  static AttendanceSessionModel fromEntity(AttendanceSession session) {
    return AttendanceSessionModel(
      sessionId: session.sessionId,
      subjectName: session.subjectName,
      subjectId: session.subjectId,
      facultyName: session.facultyName,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      qrCodeData: session.qrCodeData,
    );
  }
}

class AttendanceRecordModel extends AttendanceRecord {
  AttendanceRecordModel({
    required String recordId,
    required String sessionId,
    required String studentId,
    required String status,
    DateTime? attendedAt,
  }) : super(
         recordId: recordId,
         sessionId: sessionId,
         studentId: studentId,
         status: status,
         attendedAt: attendedAt,
       );

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      recordId: json['record_id'] ?? '',
      sessionId: json['session_id'] ?? '',
      studentId: json['student_id'] ?? '',
      status: json['status'] ?? 'absent',
      attendedAt: json['attended_at'] != null
          ? DateTime.parse(json['attended_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'record_id': recordId,
      'session_id': sessionId,
      'student_id': studentId,
      'status': status,
      'attended_at': attendedAt?.toIso8601String(),
    };
  }

  static AttendanceRecordModel fromEntity(AttendanceRecord record) {
    return AttendanceRecordModel(
      recordId: record.recordId,
      sessionId: record.sessionId,
      studentId: record.studentId,
      status: record.status,
      attendedAt: record.attendedAt,
    );
  }
}
