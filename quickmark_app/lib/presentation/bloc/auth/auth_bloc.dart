import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc({required AuthRepository authRepository})
    : _authRepository = authRepository,
      super(const AuthInitial()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<LogoutEvent>(_onLogout);
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());

    try {
      final user = await _authRepository.login(
        rollNumber: event.rollNumber,
        password: event.password,
      );
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onRegister(RegisterEvent event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());

    try {
      final user = await _authRepository.register(
        rollNumber: event.rollNumber,
        email: event.email,
        password: event.password,
        name: event.name,
        departmentId: event.departmentId,
        currentYear: event.currentYear,
        section: event.section,
      );
      emit(
        AuthRegistrationSuccess(
          user: user,
          message: 'Registration successful!',
        ),
      );
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    emit(const AuthLoading());

    try {
      await _authRepository.logout();
      emit(const AuthUnauthenticated());
    } catch (e) {
      // Even if logout fails on the server, we should clear local data
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatusEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      final user = await _authRepository.getCurrentUser();
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(const AuthUnauthenticated());
    }
  }
}
