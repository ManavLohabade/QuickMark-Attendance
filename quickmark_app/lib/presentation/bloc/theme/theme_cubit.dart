// lib/presentation/bloc/theme/theme_cubit.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Manages the application's theme mode (light/dark).
class ThemeCubit extends Cubit<ThemeMode> {
  // Initialize with the system's default theme.
  ThemeCubit() : super(ThemeMode.system);

  /// Toggles the theme between light and dark mode.
  void toggleTheme(bool isCurrentlyDark) {
    // If the current state is dark, emit light, and vice-versa.
    emit(isCurrentlyDark ? ThemeMode.light : ThemeMode.dark);
  }
}