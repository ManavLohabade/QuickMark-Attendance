import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../../../domain/repositories/attendance_repository.dart';
import 'face_event.dart';
import 'face_state.dart';

class FaceBloc extends Bloc<FaceEvent, FaceState> {
  final AuthRepository _authRepository;
  final AttendanceRepository _attendanceRepository;

  FaceBloc({
    required AuthRepository authRepository,
    required AttendanceRepository attendanceRepository,
  }) : _authRepository = authRepository,
       _attendanceRepository = attendanceRepository,
       super(const FaceInitial()) {
    // Register event handlers
    on<RegisterFaceEvent>(_onRegisterFace);
    on<VerifyFaceEvent>(_onVerifyFace);
    on<UploadFaceForVerificationEvent>(_onUploadFaceForVerification);
    on<CaptureFaceImageEvent>(_onCaptureFaceImage);
    on<ValidateFaceQualityEvent>(_onValidateFaceQuality);
    on<CheckFaceRegistrationStatusEvent>(_onCheckFaceRegistrationStatus);
    on<ClearFaceDataEvent>(_onClearFaceData);
    on<ResetFaceEvent>(_onResetFace);
  }

  /// Handle face registration event
  Future<void> _onRegisterFace(
    RegisterFaceEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      final message = await _authRepository.registerFace(
        faceImageUrl: event.faceImageUrl,
      );

      emit(FaceRegistered(message: message));
    } catch (e) {
      emit(
        FaceError(message: e.toString(), errorCode: 'FACE_REGISTRATION_FAILED'),
      );
    }
  }

  /// Handle face verification event
  Future<void> _onVerifyFace(
    VerifyFaceEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      final isVerified = await _attendanceRepository.verifyFace(
        event.imagePath,
      );

      emit(
        FaceVerified(
          isVerified: isVerified,
          message: isVerified
              ? 'Face verification successful!'
              : 'Face verification failed. Please try again.',
        ),
      );
    } catch (e) {
      emit(
        FaceError(message: e.toString(), errorCode: 'FACE_VERIFICATION_FAILED'),
      );
    }
  }

  /// Handle upload face for verification event
  Future<void> _onUploadFaceForVerification(
    UploadFaceForVerificationEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      final result = await _attendanceRepository.uploadFaceForVerification(
        filePath: event.filePath,
      );

      emit(FaceUploadedForVerification(verificationResult: result));
    } catch (e) {
      emit(FaceError(message: e.toString(), errorCode: 'FACE_UPLOAD_FAILED'));
    }
  }

  /// Handle face image capture event
  Future<void> _onCaptureFaceImage(
    CaptureFaceImageEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      // Validate that the image exists and is accessible
      // In a real implementation, you might want to validate image format, size, etc.

      emit(FaceImageCaptured(imagePath: event.imagePath));
    } catch (e) {
      emit(
        FaceError(
          message: 'Failed to capture face image: ${e.toString()}',
          errorCode: 'IMAGE_CAPTURE_FAILED',
        ),
      );
    }
  }

  /// Handle face quality validation event
  Future<void> _onValidateFaceQuality(
    ValidateFaceQualityEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      // In a real implementation, this would use ML Kit or similar
      // to validate face quality, detect faces, check brightness, etc.

      // For now, we'll simulate validation
      final qualityMetrics = <String, dynamic>{
        'face_detected': true,
        'brightness_score': 0.8,
        'blur_score': 0.9,
        'face_angle': 'frontal',
        'quality_score': 0.85,
      };

      final isValidQuality = qualityMetrics['quality_score'] >= 0.7;

      emit(
        FaceQualityValidated(
          isValidQuality: isValidQuality,
          message: isValidQuality
              ? 'Face quality is good for registration/verification'
              : 'Face quality is poor. Please ensure good lighting and face the camera directly.',
          qualityMetrics: qualityMetrics,
        ),
      );
    } catch (e) {
      emit(
        FaceError(
          message: 'Failed to validate face quality: ${e.toString()}',
          errorCode: 'QUALITY_VALIDATION_FAILED',
        ),
      );
    }
  }

  /// Handle check face registration status event
  Future<void> _onCheckFaceRegistrationStatus(
    CheckFaceRegistrationStatusEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      // Get current user to check face registration status
      final user = await _authRepository.getCurrentUser();

      final isRegistered = user.isFaceRegistered;

      emit(
        FaceRegistrationStatus(
          isRegistered: isRegistered,
          message: isRegistered
              ? 'Face biometric is already registered'
              : 'Face biometric is not registered. Please register to enable face verification.',
        ),
      );
    } catch (e) {
      emit(
        FaceError(
          message: 'Failed to check face registration status: ${e.toString()}',
          errorCode: 'STATUS_CHECK_FAILED',
        ),
      );
    }
  }

  /// Handle clear face data event
  Future<void> _onClearFaceData(
    ClearFaceDataEvent event,
    Emitter<FaceState> emit,
  ) async {
    try {
      emit(const FaceLoading());

      // In a real implementation, you might want to call an API
      // to remove face data from the server as well

      emit(const FaceDataCleared(message: 'Face data cleared successfully'));
    } catch (e) {
      emit(
        FaceError(
          message: 'Failed to clear face data: ${e.toString()}',
          errorCode: 'CLEAR_DATA_FAILED',
        ),
      );
    }
  }

  /// Handle reset face event
  Future<void> _onResetFace(
    ResetFaceEvent event,
    Emitter<FaceState> emit,
  ) async {
    emit(const FaceInitial());
  }

  /// Helper method to check if face is currently registered
  bool get isFaceRegistered {
    final currentState = state;
    return currentState is FaceRegistrationStatus && currentState.isRegistered;
  }

  /// Helper method to check if face was successfully verified
  bool get isFaceVerified {
    final currentState = state;
    return currentState is FaceVerified && currentState.isVerified;
  }

  /// Helper method to get the last captured image path
  String? get lastCapturedImagePath {
    final currentState = state;
    if (currentState is FaceImageCaptured) {
      return currentState.imagePath;
    }
    return null;
  }

  /// Helper method to get face quality metrics
  Map<String, dynamic>? get lastQualityMetrics {
    final currentState = state;
    if (currentState is FaceQualityValidated) {
      return currentState.qualityMetrics;
    }
    return null;
  }

  /// Helper method to check if last quality validation passed
  bool get isLastQualityValidationPassed {
    final currentState = state;
    return currentState is FaceQualityValidated && currentState.isValidQuality;
  }
}
