import 'package:equatable/equatable.dart';
import '../../../domain/entities/user.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial state when the app starts
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// State when authentication operations are in progress
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// State when user is successfully authenticated
class AuthAuthenticated extends AuthState {
  final User user;

  const AuthAuthenticated({required this.user});

  @override
  List<Object?> get props => [user];
}

/// State when user is not authenticated
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// State when an authentication error occurs
class AuthError extends AuthState {
  final String message;

  const AuthError({required this.message});

  @override
  List<Object?> get props => [message];
}

/// State when registration is successful
class AuthRegistrationSuccess extends AuthState {
  final User user;
  final String message;

  const AuthRegistrationSuccess({required this.user, required this.message});

  @override
  List<Object?> get props => [user, message];
}

/// State when face registration is successful
class AuthFaceRegistrationSuccess extends AuthState {
  final String message;

  const AuthFaceRegistrationSuccess({required this.message});

  @override
  List<Object?> get props => [message];
}

/// State when photo upload is successful
class AuthPhotoUploadSuccess extends AuthState {
  final String photoUrl;
  final String message;

  const AuthPhotoUploadSuccess({required this.photoUrl, required this.message});

  @override
  List<Object?> get props => [photoUrl, message];
}

/// State when departments are loaded successfully
class AuthDepartmentsLoaded extends AuthState {
  final List<Map<String, dynamic>> departments;

  const AuthDepartmentsLoaded({required this.departments});

  @override
  List<Object?> get props => [departments];
}
