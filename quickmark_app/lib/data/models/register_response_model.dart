import 'student_model.dart';

/// Model for registration API response
class RegisterResponseModel {
  final String message;
  final StudentModel student;

  RegisterResponseModel({required this.message, required this.student});

  /// Create RegisterResponseModel from API JSON response
  factory RegisterResponseModel.fromJson(Map<String, dynamic> json) {
    return RegisterResponseModel(
      message: json['message'] ?? 'Student registered successfully!',
      student: StudentModel.fromJson(json['student'] ?? {}),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'message': message, 'student': student.toJson()};
  }

  @override
  String toString() {
    return 'RegisterResponseModel(message: $message, student: $student)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is RegisterResponseModel &&
        other.message == message &&
        other.student == student;
  }

  @override
  int get hashCode {
    return message.hashCode ^ student.hashCode;
  }
}
