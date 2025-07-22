import 'package:equatable/equatable.dart';

abstract class AttendanceEvent extends Equatable {
  const AttendanceEvent();

  @override
  List<Object?> get props => [];
}

/// Event to load active attendance sessions
class LoadActiveSessionsEvent extends AttendanceEvent {
  const LoadActiveSessionsEvent();
}

/// Event triggered when QR code is scanned
class ScanQRCodeEvent extends AttendanceEvent {
  final String qrData;

  const ScanQRCodeEvent({required this.qrData});

  @override
  List<Object?> get props => [qrData];
}

/// Event to mark attendance
class MarkAttendanceEvent extends AttendanceEvent {
  final String verifySessionToken;
  final bool faceVerify;

  const MarkAttendanceEvent({
    required this.verifySessionToken,
    required this.faceVerify,
  });

  @override
  List<Object?> get props => [verifySessionToken, faceVerify];
}

/// Event to verify face for attendance
class VerifyFaceEvent extends AttendanceEvent {
  final String imagePath;

  const VerifyFaceEvent({required this.imagePath});

  @override
  List<Object?> get props => [imagePath];
}

/// Event to upload face for verification
class UploadFaceForVerificationEvent extends AttendanceEvent {
  final String filePath;

  const UploadFaceForVerificationEvent({required this.filePath});

  @override
  List<Object?> get props => [filePath];
}

/// Event to load attendance calendar/history
class LoadAttendanceCalendarEvent extends AttendanceEvent {
  final int? subjectId;
  final String? startDate;
  final String? endDate;

  const LoadAttendanceCalendarEvent({
    this.subjectId,
    this.startDate,
    this.endDate,
  });

  @override
  List<Object?> get props => [subjectId, startDate, endDate];
}

/// Event to reset attendance state
class ResetAttendanceEvent extends AttendanceEvent {
  const ResetAttendanceEvent();
}
