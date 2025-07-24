import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Event triggered when user attempts to login
class LoginEvent extends AuthEvent {
  final String rollNumber;
  final String password;

  const LoginEvent({required this.rollNumber, required this.password});

  @override
  List<Object?> get props => [rollNumber, password];
}

/// Event triggered when user attempts to register
class RegisterEvent extends AuthEvent {
  final String rollNumber;
  final String name;
  final String email;
  final String password;
  final int departmentId;
  final int currentYear;
  final String section;

  const RegisterEvent({
    required this.rollNumber,
    required this.name,
    required this.email,
    required this.password,
    required this.departmentId,
    required this.currentYear,
    required this.section,
  });

  @override
  List<Object?> get props => [
    rollNumber,
    name,
    email,
    password,
    departmentId,
    currentYear,
    section,
  ];
}

/// Event triggered when user logs out
class LogoutEvent extends AuthEvent {
  const LogoutEvent();
}

/// Event triggered to check current authentication status
class CheckAuthStatusEvent extends AuthEvent {
  const CheckAuthStatusEvent();
}

/// Event triggered to get current user data
class GetCurrentUserEvent extends AuthEvent {
  const GetCurrentUserEvent();
}

/// Event triggered to register face data
class RegisterFaceEvent extends AuthEvent {
  final String faceImageUrl;

  const RegisterFaceEvent({required this.faceImageUrl});

  @override
  List<Object?> get props => [faceImageUrl];
}

/// Event triggered to upload profile photo
class UploadPhotoEvent extends AuthEvent {
  final String filePath;

  const UploadPhotoEvent({required this.filePath});

  @override
  List<Object?> get props => [filePath];
}

/// Event triggered to get departments list
class GetDepartmentsEvent extends AuthEvent {
  const GetDepartmentsEvent();
}
