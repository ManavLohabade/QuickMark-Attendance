import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/app_error_widget.dart';
import '../register/register_screen.dart';

class LoginScreen extends StatefulWidget {
  static const routeName = '/login';

  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _rollNumberController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _rollNumberController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
        LoginEvent(
          rollNumber: _rollNumberController.text.trim(),
          password: _passwordController.text,
        ),
      );
    }
  }

  void _navigateToRegister() {
    Navigator.pushNamed(context, RegisterScreen.routeName);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(
        0xFFF5F5F5,
      ), // backgroundColor from design.json
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          setState(() {
            _isLoading = state is AuthLoading;
          });

          if (state is AuthAuthenticated) {
            Navigator.pushReplacementNamed(context, '/home');
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(
                  0xFFD0021B,
                ), // errorColor from design.json
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 40),

                    // App Logo
                    const Center(child: AppLogo(size: 120)),

                    const SizedBox(height: 32),

                    // Welcome Text
                    Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: const Color(
                          0xFF333333,
                        ), // textColor from design.json
                        fontFamily: 'Roboto',
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 8),

                    Text(
                      'Sign in to mark your attendance',
                      style: TextStyle(
                        fontSize: 16,
                        color: const Color(0xFF333333).withValues(alpha: 0.7),
                        fontFamily: 'Roboto',
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 40),

                    // Roll Number Field
                    _buildTextField(
                      controller: _rollNumberController,
                      label: 'Roll Number',
                      hint: 'Enter your roll number',
                      prefixIcon: Icons.badge_outlined,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter your roll number';
                        }
                        if (value!.length < 3) {
                          return 'Roll number must be at least 3 characters';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 20),

                    // Password Field
                    _buildTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Enter your password',
                      prefixIcon: Icons.lock_outline,
                      isPassword: true,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter your password';
                        }
                        if (value!.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 32),

                    // Login Button
                    _buildLoginButton(),

                    const SizedBox(height: 24),

                    // Register Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: TextStyle(
                            fontSize: 16,
                            color: const Color(
                              0xFF333333,
                            ).withValues(alpha: 0.7),
                            fontFamily: 'Roboto',
                          ),
                        ),
                        GestureDetector(
                          onTap: _navigateToRegister,
                          child: const Text(
                            'Register here',
                            style: TextStyle(
                              fontSize: 16,
                              color: Color(
                                0xFF4A90E2,
                              ), // primaryColor from design.json
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Roboto',
                            ),
                          ),
                        ),
                      ],
                    ),

                    if (state is AuthError) ...[
                      const SizedBox(height: 24),
                      AppErrorWidget(
                        message: state.message,
                        onRetry: _handleLogin,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData prefixIcon,
    bool isPassword = false,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword && !_isPasswordVisible,
      style: const TextStyle(
        fontSize: 16,
        color: Color(0xFF333333),
        fontFamily: 'Roboto',
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(
          prefixIcon,
          color: const Color(0xFF4A90E2), // primaryColor from design.json
        ),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                  color: const Color(0xFF4A90E2),
                ),
                onPressed: () {
                  setState(() {
                    _isPasswordVisible = !_isPasswordVisible;
                  });
                },
              )
            : null,
        labelStyle: TextStyle(
          color: const Color(0xFF333333).withValues(alpha: 0.7),
          fontFamily: 'Roboto',
        ),
        hintStyle: TextStyle(
          color: const Color(0xFF333333).withValues(alpha: 0.5),
          fontFamily: 'Roboto',
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(
            8,
          ), // borderRadius from design.json
          borderSide: const BorderSide(
            color: Color(0xFFCCCCCC), // border color from design.json
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFCCCCCC), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(
            color: Color(0xFF4A90E2), // focusedBorder color from design.json
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(
            color: Color(0xFFD0021B), // errorColor from design.json
            width: 1,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD0021B), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          vertical: 16,
          horizontal: 16,
        ),
      ),
      validator: validator,
    );
  }

  Widget _buildLoginButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _handleLogin,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(
          0xFF4A90E2,
        ), // primaryColor from design.json
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(
          vertical: 12, // padding from design.json
          horizontal: 24,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(
            8,
          ), // borderRadius from design.json
        ),
        elevation: 2, // elevation from design.json
        textStyle: const TextStyle(
          fontSize: 18, // button fontSize from design.json
          fontWeight: FontWeight.bold,
          fontFamily: 'Roboto',
          letterSpacing: 1.25, // letterSpacing from design.json
        ),
      ),
      child: _isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : const Text('LOGIN'),
    );
  }
}
