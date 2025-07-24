import 'package:equatable/equatable.dart';

abstract class FaceState extends Equatable {
  const FaceState();

  @override
  List<Object?> get props => [];
}

/// Initial state when face bloc is created
class FaceInitial extends FaceState {
  const FaceInitial();
}

/// State when face operations are loading
class FaceLoading extends FaceState {
  const FaceLoading();
}

/// State when face is successfully registered
class FaceRegistered extends FaceState {
  final String message;

  const FaceRegistered({required this.message});

  @override
  List<Object?> get props => [message];
}

/// State when face verification is completed
class FaceVerified extends FaceState {
  final bool isVerified;
  final String message;
  final double? confidenceScore;

  const FaceVerified({
    required this.isVerified,
    required this.message,
    this.confidenceScore,
  });

  @override
  List<Object?> get props => [isVerified, message, confidenceScore];
}

/// State when face image is captured successfully
class FaceImageCaptured extends FaceState {
  final String imagePath;

  const FaceImageCaptured({required this.imagePath});

  @override
  List<Object?> get props => [imagePath];
}

/// State when face quality validation is completed
class FaceQualityValidated extends FaceState {
  final bool isValidQuality;
  final String message;
  final Map<String, dynamic>? qualityMetrics;

  const FaceQualityValidated({
    required this.isValidQuality,
    required this.message,
    this.qualityMetrics,
  });

  @override
  List<Object?> get props => [isValidQuality, message, qualityMetrics];
}

/// State when face upload for verification is successful
class FaceUploadedForVerification extends FaceState {
  final Map<String, dynamic> verificationResult;

  const FaceUploadedForVerification({required this.verificationResult});

  @override
  List<Object?> get props => [verificationResult];
}

/// State indicating face registration status
class FaceRegistrationStatus extends FaceState {
  final bool isRegistered;
  final String message;

  const FaceRegistrationStatus({
    required this.isRegistered,
    required this.message,
  });

  @override
  List<Object?> get props => [isRegistered, message];
}

/// State when face data is cleared successfully
class FaceDataCleared extends FaceState {
  final String message;

  const FaceDataCleared({required this.message});

  @override
  List<Object?> get props => [message];
}

/// State when a face operation error occurs
class FaceError extends FaceState {
  final String message;
  final String? errorCode;

  const FaceError({required this.message, this.errorCode});

  @override
  List<Object?> get props => [message, errorCode];
}
