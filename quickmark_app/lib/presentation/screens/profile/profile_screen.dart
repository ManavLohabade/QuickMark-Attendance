// lib/presentation/screens/profile/profile_screen.dart
// MODIFIED TO USE THEME COLORS INSTEAD OF HARDCODED VALUES

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';
import '../../../core/utils/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  static const routeName = '/profile';

  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _rollNumberController = TextEditingController();
  final _departmentController = TextEditingController();
  final _yearController = TextEditingController();
  final _sectionController = TextEditingController();

  bool _isEditing = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      final user = authState.user;
      _nameController.text = user.name;
      _emailController.text = user.email;
      _rollNumberController.text = user.rollNumber;
      _departmentController.text = user.department ?? '';
      _yearController.text = user.year?.toString() ?? '';
      _sectionController.text = user.section ?? '';
    }
  }

  void _toggleEdit() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        _loadUserData();
      }
    });
  }

  void _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _isLoading = false;
      _isEditing = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profile updated successfully'),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _rollNumberController.dispose();
    _departmentController.dispose();
    _yearController.dispose();
    _sectionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // The theme from the context
    final theme = Theme.of(context);

    return Scaffold(
      // ## FIX: Removed hardcoded background color to allow theme to apply ##
      // backgroundColor: Colors.grey[50], // This was the issue
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Profile' : 'My Profile'),
        // Let the AppBar theme handle its own colors
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: theme.colorScheme.primary,
        actions: _isEditing
            ? [
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: _toggleEdit,
                  tooltip: 'Cancel',
                )
              ]
            : [
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: _toggleEdit,
                  tooltip: 'Edit Profile',
                )
              ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                children: [
                  _buildProfileHeader(state.user),
                  const SizedBox(height: 24),
                  ..._buildInfoFields(),
                  const SizedBox(height: 32),
                  if (_isEditing) _buildSaveButton(),
                  const SizedBox(height: 24),
                ],
              ),
            );
          }
          return const Center(child: Text('Unable to load profile data.'));
        },
      ),
    );
  }

  Widget _buildProfileHeader(dynamic user) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
            child: Icon(Icons.person, size: 50, color: theme.colorScheme.primary),
          ),
          const SizedBox(height: 16),
          Text(
            user.name,
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            user.email,
            style: theme.textTheme.bodyLarge?.copyWith(color: theme.hintColor),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildInfoFields() {
    return [
      _buildInfoField(
          controller: _nameController,
          label: 'Full Name',
          icon: Icons.person_outline,
      ),
       _buildInfoField(
          controller: _rollNumberController,
          label: 'Roll Number',
          icon: Icons.badge_outlined,
          enabled: false
      ),
      _buildInfoField(
          controller: _departmentController,
          label: 'Department',
          icon: Icons.school_outlined,
      ),
       _buildInfoField(
          controller: _yearController,
          label: 'Current Year',
          icon: Icons.calendar_today_outlined,
          keyboardType: TextInputType.number,
      ),
      _buildInfoField(
          controller: _sectionController,
          label: 'Section',
          icon: Icons.class_outlined,
      ),
    ];
  }

  Widget _buildInfoField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool enabled = true,
    TextInputType? keyboardType,
  }) {
    final theme = Theme.of(context);
    // In view mode, this Card will now adapt to the theme (light card in light mode, dark card in dark mode)
    if (!_isEditing) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: theme.dividerColor)
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Icon(icon, color: theme.colorScheme.primary, size: 24),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    controller.text,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    // Edit mode remains the same, using theme-aware TextFormField
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: theme.colorScheme.primary, size: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: !enabled,
          fillColor: theme.colorScheme.onSurface.withOpacity(0.05),
        ),
        validator: (value) => value == null || value.isEmpty ? '$label is required' : null,
      ),
    );
  }

  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isLoading ? null : _saveProfile,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        icon: _isLoading
            ? Container(
                width: 20,
                height: 20,
                child: const CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.save_as_outlined),
        label: Text(_isLoading ? 'Saving...' : 'Save Changes', style: const TextStyle(fontSize: 16)),
      ),
    );
  }
}