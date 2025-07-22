import 'student_model.dart';

/// Model for login API response
class LoginResponseModel {
  final String message;
  final StudentModel student;
  final String token;

  LoginResponseModel({
    required this.message,
    required this.student,
    required this.token,
  });

  /// Create LoginResponseModel from API JSON response
  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      message: json['message'] ?? 'Logged in successfully!',
      student: StudentModel.fromJson(json['student'] ?? {}),
      token: json['token'] ?? '',
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {'message': message, 'student': student.toJson(), 'token': token};
  }

  @override
  String toString() {
    return 'LoginResponseModel(message: $message, student: $student, token: $token)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginResponseModel &&
        other.message == message &&
        other.student == student &&
        other.token == token;
  }

  @override
  int get hashCode {
    return message.hashCode ^ student.hashCode ^ token.hashCode;
  }
}
