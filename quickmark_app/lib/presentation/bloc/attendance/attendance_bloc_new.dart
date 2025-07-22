import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/repositories/attendance_repository.dart';
import '../../../domain/entities/attendance.dart';
import 'attendance_event.dart';
import 'attendance_state.dart';

class AttendanceBloc extends Bloc<AttendanceEvent, AttendanceState> {
  final AttendanceRepository _attendanceRepository;

  AttendanceBloc({required AttendanceRepository attendanceRepository})
    : _attendanceRepository = attendanceRepository,
      super(const AttendanceInitial()) {
    // Register event handlers
    on<LoadActiveSessionsEvent>(_onLoadActiveSessions);
    on<ScanQRCodeEvent>(_onScanQRCode);
    on<MarkAttendanceEvent>(_onMarkAttendance);
    on<VerifyFaceEvent>(_onVerifyFace);
    on<UploadFaceForVerificationEvent>(_onUploadFaceForVerification);
    on<LoadAttendanceCalendarEvent>(_onLoadAttendanceCalendar);
    on<ResetAttendanceEvent>(_onResetAttendance);
  }

  /// Handle load active sessions event
  Future<void> _onLoadActiveSessions(
    LoadActiveSessionsEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final sessions = await _attendanceRepository.getActiveSessions();

      emit(AttendanceActiveSessionsLoaded(sessions: sessions));
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle QR code scan event
  Future<void> _onScanQRCode(
    ScanQRCodeEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final sessionData = _attendanceRepository.parseQRCode(event.qrData);

      emit(AttendanceQRCodeScanned(sessionData: sessionData));
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle mark attendance event
  Future<void> _onMarkAttendance(
    MarkAttendanceEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final record = await _attendanceRepository.markAttendance(
        verifySessionToken: event.verifySessionToken,
        faceVerify: event.faceVerify,
      );

      emit(
        AttendanceMarked(
          record: record,
          message: 'Attendance marked successfully!',
        ),
      );
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle verify face event
  Future<void> _onVerifyFace(
    VerifyFaceEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final isVerified = await _attendanceRepository.verifyFace(
        event.imagePath,
      );

      emit(
        AttendanceFaceVerified(
          isVerified: isVerified,
          message: isVerified
              ? 'Face verification successful!'
              : 'Face verification failed. Please try again.',
        ),
      );
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle upload face for verification event
  Future<void> _onUploadFaceForVerification(
    UploadFaceForVerificationEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final result = await _attendanceRepository.uploadFaceForVerification(
        filePath: event.filePath,
      );

      emit(AttendanceFaceUploadedForVerification(verificationResult: result));
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle load attendance calendar event
  Future<void> _onLoadAttendanceCalendar(
    LoadAttendanceCalendarEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    try {
      emit(const AttendanceLoading());

      final records = await _attendanceRepository.getAttendanceCalendar(
        subjectId: event.subjectId,
        startDate: event.startDate,
        endDate: event.endDate,
      );

      emit(AttendanceCalendarLoaded(records: records));
    } catch (e) {
      emit(AttendanceError(message: e.toString()));
    }
  }

  /// Handle reset attendance event
  Future<void> _onResetAttendance(
    ResetAttendanceEvent event,
    Emitter<AttendanceState> emit,
  ) async {
    emit(const AttendanceInitial());
  }

  /// Helper method to check if there are active sessions
  bool get hasActiveSessions {
    final currentState = state;
    return currentState is AttendanceActiveSessionsLoaded &&
        currentState.sessions.isNotEmpty;
  }

  /// Helper method to get current active sessions
  List<AttendanceSession>? get activeSessions {
    final currentState = state;
    if (currentState is AttendanceActiveSessionsLoaded) {
      return currentState.sessions;
    }
    return null;
  }

  /// Helper method to get current attendance records
  List<AttendanceRecord>? get attendanceRecords {
    final currentState = state;
    if (currentState is AttendanceCalendarLoaded) {
      return currentState.records;
    }
    return null;
  }
}
