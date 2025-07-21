import 'attendance_model.dart';

/// Model for attendance mark API response
class AttendanceMarkResponseModel {
  final String message;
  final AttendanceRecordModel record;

  AttendanceMarkResponseModel({required this.message, required this.record});

  /// Create AttendanceMarkResponseModel from API JSON response
  factory AttendanceMarkResponseModel.fromJson(Map<String, dynamic> json) {
    return AttendanceMarkResponseModel(
      message: json['message'] ?? 'Attendance marked successfully!',
      record: AttendanceRecordModel.fromJson(json['record'] ?? {}),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'message': message, 'record': record.toJson()};
  }

  @override
  String toString() {
    return 'AttendanceMarkResponseModel(message: $message, record: $record)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AttendanceMarkResponseModel &&
        other.message == message &&
        other.record == record;
  }

  @override
  int get hashCode {
    return message.hashCode ^ record.hashCode;
  }
}
