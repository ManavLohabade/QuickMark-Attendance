import 'package:equatable/equatable.dart';

abstract class FaceEvent extends Equatable {
  const FaceEvent();

  @override
  List<Object?> get props => [];
}

/// Event to register face biometric data
class RegisterFaceEvent extends FaceEvent {
  final String faceImageUrl;

  const RegisterFaceEvent({required this.faceImageUrl});

  @override
  List<Object?> get props => [faceImageUrl];
}

/// Event to verify face against stored biometric
class VerifyFaceEvent extends FaceEvent {
  final String imagePath;

  const VerifyFaceEvent({required this.imagePath});

  @override
  List<Object?> get props => [imagePath];
}

/// Event to upload face image for verification during attendance
class UploadFaceForVerificationEvent extends FaceEvent {
  final String filePath;

  const UploadFaceForVerificationEvent({required this.filePath});

  @override
  List<Object?> get props => [filePath];
}

/// Event to capture face image from camera
class CaptureFaceImageEvent extends FaceEvent {
  final String imagePath;

  const CaptureFaceImageEvent({required this.imagePath});

  @override
  List<Object?> get props => [imagePath];
}

/// Event to validate face quality before registration/verification
class ValidateFaceQualityEvent extends FaceEvent {
  final String imagePath;

  const ValidateFaceQualityEvent({required this.imagePath});

  @override
  List<Object?> get props => [imagePath];
}

/// Event to check if face is already registered
class CheckFaceRegistrationStatusEvent extends FaceEvent {
  const CheckFaceRegistrationStatusEvent();
}

/// Event to clear face data (logout/reset)
class ClearFaceDataEvent extends FaceEvent {
  const ClearFaceDataEvent();
}

/// Event to reset face bloc to initial state
class ResetFaceEvent extends FaceEvent {
  const ResetFaceEvent();
}
