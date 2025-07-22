class AttendanceSession {
  final String sessionId;
  final String subjectName;
  final String subjectId;
  final String facultyName;
  final DateTime sessionDate;
  final DateTime startTime;
  final DateTime? endTime;
  final String status;
  final String? qrCodeData;

  AttendanceSession({
    required this.sessionId,
    required this.subjectName,
    required this.subjectId,
    required this.facultyName,
    required this.sessionDate,
    required this.startTime,
    this.endTime,
    required this.status,
    this.qrCodeData,
  });

  factory AttendanceSession.fromJson(Map<String, dynamic> json) {
    return AttendanceSession(
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
}

class AttendanceRecord {
  final String recordId;
  final String sessionId;
  final String studentId;
  final String status;
  final DateTime? attendedAt;

  AttendanceRecord({
    required this.recordId,
    required this.sessionId,
    required this.studentId,
    required this.status,
    this.attendedAt,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
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
}
