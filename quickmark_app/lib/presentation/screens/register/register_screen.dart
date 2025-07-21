import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/app_error_widget.dart';

class RegisterScreen extends StatefulWidget {
  static const routeName = '/register';

  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _rollNumberController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _departmentController = TextEditingController();
  final _yearController = TextEditingController();
  final _sectionController = TextEditingController();

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _rollNumberController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _departmentController.dispose();
    _yearController.dispose();
    _sectionController.dispose();
    super.dispose();
  }

  void _handleRegister() {
    if (_formKey.currentState?.validate() ?? false) {
      // For now, navigate to face registration
      // In the future, you'll integrate with AuthBloc
      Navigator.pushNamed(context, '/face-registration');
    }
  }

  void _navigateToLogin() {
    Navigator.pop(context);
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

          if (state is AuthRegistrationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: const Color(
                  0xFF50E3C2,
                ), // accentColor from design.json
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            );
            // Navigate to face registration after successful account creation
            Navigator.pushReplacementNamed(context, '/face-registration');
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
                    const SizedBox(height: 20),

                    // App Logo
                    const Center(child: AppLogo(size: 100)),

                    const SizedBox(height: 24),

                    // Welcome Text
                    const Text(
                      'Create Account',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF333333), // textColor from design.json
                        fontFamily: 'Roboto',
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 8),

                    Text(
                      'Register for QuickMark attendance',
                      style: TextStyle(
                        fontSize: 16,
                        color: const Color(0xFF333333).withOpacity(0.7),
                        fontFamily: 'Roboto',
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 32),

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

                    const SizedBox(height: 16),

                    // Name Field
                    _buildTextField(
                      controller: _nameController,
                      label: 'Full Name',
                      hint: 'Enter your full name',
                      prefixIcon: Icons.person_outline,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter your full name';
                        }
                        if (value!.length < 2) {
                          return 'Name must be at least 2 characters';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 16),

                    // Email Field
                    _buildTextField(
                      controller: _emailController,
                      label: 'Email Address',
                      hint: 'Enter your email address',
                      prefixIcon: Icons.email_outlined,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter your email address';
                        }
                        if (!RegExp(
                          r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                        ).hasMatch(value!)) {
                          return 'Please enter a valid email address';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 16),

                    // Department Field
                    _buildTextField(
                      controller: _departmentController,
                      label: 'Department ID',
                      hint: 'Enter department ID (e.g., 1)',
                      prefixIcon: Icons.business_outlined,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please enter department ID';
                        }
                        if (int.tryParse(value!) == null) {
                          return 'Department ID must be a number';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 16),

                    // Year and Section Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _yearController,
                            label: 'Year',
                            hint: 'e.g., 2024',
                            prefixIcon: Icons.calendar_today_outlined,
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Required';
                              }
                              if (int.tryParse(value!) == null) {
                                return 'Must be number';
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(
                            controller: _sectionController,
                            label: 'Section',
                            hint: 'e.g., A',
                            prefixIcon: Icons.class_outlined,
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Required';
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Password Field
                    _buildTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Enter your password',
                      prefixIcon: Icons.lock_outline,
                      isPassword: true,
                      isPasswordVisible: _isPasswordVisible,
                      onPasswordVisibilityToggle: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
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

                    const SizedBox(height: 16),

                    // Confirm Password Field
                    _buildTextField(
                      controller: _confirmPasswordController,
                      label: 'Confirm Password',
                      hint: 'Confirm your password',
                      prefixIcon: Icons.lock_outline,
                      isPassword: true,
                      isPasswordVisible: _isConfirmPasswordVisible,
                      onPasswordVisibilityToggle: () {
                        setState(() {
                          _isConfirmPasswordVisible =
                              !_isConfirmPasswordVisible;
                        });
                      },
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Please confirm your password';
                        }
                        if (value != _passwordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 32),

                    // Register Button
                    _buildRegisterButton(),

                    const SizedBox(height: 24),

                    // Login Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Already have an account? ',
                          style: TextStyle(
                            fontSize: 16,
                            color: const Color(0xFF333333).withOpacity(0.7),
                            fontFamily: 'Roboto',
                          ),
                        ),
                        GestureDetector(
                          onTap: _navigateToLogin,
                          child: const Text(
                            'Login here',
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
                        onRetry: _handleRegister,
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
    bool isPasswordVisible = false,
    VoidCallback? onPasswordVisibilityToggle,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword && !isPasswordVisible,
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
                  isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                  color: const Color(0xFF4A90E2),
                ),
                onPressed: onPasswordVisibilityToggle,
              )
            : null,
        labelStyle: TextStyle(
          color: const Color(0xFF333333).withOpacity(0.7),
          fontFamily: 'Roboto',
        ),
        hintStyle: TextStyle(
          color: const Color(0xFF333333).withOpacity(0.5),
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

  Widget _buildRegisterButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _handleRegister,
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
          : const Text('REGISTER'),
    );
  }
}
