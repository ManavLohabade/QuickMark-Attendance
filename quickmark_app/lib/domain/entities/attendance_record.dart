class AttendanceRecord {
  final String id;
  final String sessionId;
  final String studentId;
  final String subjectId;
  final String subjectName;
  final String facultyName;
  final DateTime timestamp;
  final bool present;
  final String verificationMethod; // 'face', 'manual', 'proxy'
  final String? imageUrl;

  AttendanceRecord({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.subjectId,
    required this.subjectName,
    required this.facultyName,
    required this.timestamp,
    required this.present,
    required this.verificationMethod,
    this.imageUrl,
  });
}
