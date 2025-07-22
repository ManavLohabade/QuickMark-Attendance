import 'student_model.dart';

/// Model for face registration API response
class FaceRegistrationResponseModel {
  final String message;
  final StudentModel student;

  FaceRegistrationResponseModel({required this.message, required this.student});

  /// Create FaceRegistrationResponseModel from API JSON response
  factory FaceRegistrationResponseModel.fromJson(Map<String, dynamic> json) {
    return FaceRegistrationResponseModel(
      message: json['message'] ?? 'Face registered successfully.',
      student: StudentModel.fromJson(json['student'] ?? {}),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'message': message, 'student': student.toJson()};
  }

  @override
  String toString() {
    return 'FaceRegistrationResponseModel(message: $message, student: $student)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is FaceRegistrationResponseModel &&
        other.message == message &&
        other.student == student;
  }

  @override
  int get hashCode {
    return message.hashCode ^ student.hashCode;
  }
}
