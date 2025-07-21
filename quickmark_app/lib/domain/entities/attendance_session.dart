class AttendanceSession {
  final String id;
  final String subjectId;
  final String subjectName;
  final String facultyId;
  final String facultyName;
  final DateTime startTime;
  final DateTime endTime;
  final String status; // 'active', 'completed', 'cancelled'
  final int totalStudents;
  final int presentStudents;
  final String? qrCode;

  AttendanceSession({
    required this.id,
    required this.subjectId,
    required this.subjectName,
    required this.facultyId,
    required this.facultyName,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.totalStudents,
    required this.presentStudents,
    this.qrCode,
  });
}
