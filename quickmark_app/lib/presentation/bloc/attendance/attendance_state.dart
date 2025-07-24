import 'package:equatable/equatable.dart';
import '../../../domain/entities/attendance.dart';

abstract class AttendanceState extends Equatable {
  const AttendanceState();

  @override
  List<Object?> get props => [];
}

/// Initial state when attendance bloc is created
class AttendanceInitial extends AttendanceState {
  const AttendanceInitial();
}

/// State when attendance operations are loading
class AttendanceLoading extends AttendanceState {
  const AttendanceLoading();
}

/// State when active sessions are loaded successfully
class AttendanceActiveSessionsLoaded extends AttendanceState {
  final List<AttendanceSession> sessions;

  const AttendanceActiveSessionsLoaded({required this.sessions});

  @override
  List<Object?> get props => [sessions];
}

/// State when QR code is scanned successfully
class AttendanceQRCodeScanned extends AttendanceState {
  final Map<String, dynamic> sessionData;

  const AttendanceQRCodeScanned({required this.sessionData});

  @override
  List<Object?> get props => [sessionData];
}

/// State when attendance is marked successfully
class AttendanceMarked extends AttendanceState {
  final AttendanceRecord record;
  final String message;

  const AttendanceMarked({required this.record, required this.message});

  @override
  List<Object?> get props => [record, message];
}

/// State when face verification is successful
class AttendanceFaceVerified extends AttendanceState {
  final bool isVerified;
  final String message;

  const AttendanceFaceVerified({
    required this.isVerified,
    required this.message,
  });

  @override
  List<Object?> get props => [isVerified, message];
}

/// State when face upload for verification is successful
class AttendanceFaceUploadedForVerification extends AttendanceState {
  final Map<String, dynamic> verificationResult;

  const AttendanceFaceUploadedForVerification({
    required this.verificationResult,
  });

  @override
  List<Object?> get props => [verificationResult];
}

/// State when attendance calendar is loaded successfully
class AttendanceCalendarLoaded extends AttendanceState {
  final List<AttendanceRecord> records;

  const AttendanceCalendarLoaded({required this.records});

  @override
  List<Object?> get props => [records];
}

/// State when an attendance error occurs
class AttendanceError extends AttendanceState {
  final String message;

  const AttendanceError({required this.message});

  @override
  List<Object?> get props => [message];
}
