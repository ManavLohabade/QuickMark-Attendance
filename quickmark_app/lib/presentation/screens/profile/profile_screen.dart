import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth.dart';

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
  final _courseController = TextEditingController();
  final _yearController = TextEditingController();
  final _sectionController = TextEditingController();
  final _semesterController = TextEditingController();

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
      _courseController.text = user.department ?? '';
      _yearController.text = user.year?.toString() ?? '';
      _sectionController.text = user.section ?? '';
      _semesterController.text = ''; // Not available in User entity
    }
  }

  void _toggleEdit() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        // If canceling edit, reload original data
        _loadUserData();
      }
    });
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    // TODO: Implement profile update
    // For now, just simulate saving
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _isLoading = false;
      _isEditing = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profile updated successfully'),
        backgroundColor: Color(0xFF50E3C2),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _rollNumberController.dispose();
    _courseController.dispose();
    _yearController.dispose();
    _sectionController.dispose();
    _semesterController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF4A90E2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.white),
              onPressed: _toggleEdit,
              tooltip: 'Edit Profile',
            ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return _buildProfileContent(state.user);
          }
          return const Center(child: Text('Unable to load profile'));
        },
      ),
    );
  }

  Widget _buildProfileContent(user) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            // Profile Header
            _buildProfileHeader(user),

            const SizedBox(height: 24),

            // Profile Form
            _buildProfileForm(),

            const SizedBox(height: 24),

            // Action Buttons
            if (_isEditing) _buildEditActions(),

            const SizedBox(height: 16),

            // Additional Options
            _buildAdditionalOptions(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(user) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: const Color(0xFF4A90E2).withOpacity(0.1),
                  child: const Icon(
                    Icons.person,
                    size: 50,
                    color: Color(0xFF4A90E2),
                  ),
                ),
                if (_isEditing)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      radius: 18,
                      backgroundColor: const Color(0xFF50E3C2),
                      child: IconButton(
                        icon: const Icon(
                          Icons.camera_alt,
                          size: 16,
                          color: Colors.white,
                        ),
                        onPressed: () {
                          // TODO: Implement profile picture update
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Profile picture update coming soon!',
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              user.name,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333),
                fontFamily: 'Roboto',
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Roll No: ${user.rollNumber}',
              style: TextStyle(
                fontSize: 16,
                color: const Color(0xFF333333).withOpacity(0.7),
                fontFamily: 'Roboto',
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF50E3C2).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${user.department ?? 'Department'} - Year ${user.year ?? 'N/A'}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF50E3C2),
                  fontFamily: 'Roboto',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileForm() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333),
                fontFamily: 'Roboto',
              ),
            ),
            const SizedBox(height: 16),

            // Name Field
            _buildFormField(
              controller: _nameController,
              label: 'Full Name',
              icon: Icons.person,
              enabled: _isEditing,
              validator: (value) =>
                  value?.isEmpty == true ? 'Name is required' : null,
            ),

            const SizedBox(height: 16),

            // Email Field
            _buildFormField(
              controller: _emailController,
              label: 'Email',
              icon: Icons.email,
              enabled: false, // Email should not be editable
              keyboardType: TextInputType.emailAddress,
            ),

            const SizedBox(height: 16),

            // Roll Number Field
            _buildFormField(
              controller: _rollNumberController,
              label: 'Roll Number',
              icon: Icons.badge,
              enabled: false, // Roll number should not be editable
            ),

            const SizedBox(height: 20),

            const Text(
              'Academic Information',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333),
                fontFamily: 'Roboto',
              ),
            ),
            const SizedBox(height: 16),

            // Department Field
            _buildFormField(
              controller: _courseController,
              label: 'Department',
              icon: Icons.school,
              enabled: _isEditing,
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: _buildFormField(
                    controller: _yearController,
                    label: 'Year',
                    icon: Icons.calendar_today,
                    enabled: _isEditing,
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildFormField(
                    controller: _sectionController,
                    label: 'Section',
                    icon: Icons.group,
                    enabled: _isEditing,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            _buildFormField(
              controller: _semesterController,
              label: 'Semester',
              icon: Icons.book,
              enabled: _isEditing,
              keyboardType: TextInputType.number,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool enabled = true,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(
          icon,
          color: enabled
              ? const Color(0xFF4A90E2)
              : const Color(0xFF4A90E2).withOpacity(0.5),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF4A90E2), width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        filled: !enabled,
        fillColor: enabled ? null : Colors.grey[50],
        labelStyle: TextStyle(
          color: enabled
              ? const Color(0xFF333333)
              : const Color(0xFF333333).withOpacity(0.5),
          fontFamily: 'Roboto',
        ),
      ),
      style: const TextStyle(fontFamily: 'Roboto', color: Color(0xFF333333)),
    );
  }

  Widget _buildEditActions() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _isLoading ? null : _toggleEdit,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(color: Color(0xFF4A90E2)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Cancel',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF4A90E2),
                fontFamily: 'Roboto',
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _isLoading ? null : _saveProfile,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF50E3C2),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Text(
                    'Save Changes',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Roboto',
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildAdditionalOptions() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.security, color: Color(0xFF4A90E2)),
            title: const Text(
              'Change Password',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontFamily: 'Roboto',
              ),
            ),
            subtitle: const Text(
              'Update your account password',
              style: TextStyle(fontFamily: 'Roboto'),
            ),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              // TODO: Navigate to change password screen
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Change password feature coming soon!'),
                ),
              );
            },
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.face, color: Color(0xFF50E3C2)),
            title: const Text(
              'Update Face Registration',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontFamily: 'Roboto',
              ),
            ),
            subtitle: const Text(
              'Re-register your face for attendance',
              style: TextStyle(fontFamily: 'Roboto'),
            ),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              Navigator.pushNamed(context, '/face-registration');
            },
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: Color(0xFFD0021B)),
            title: const Text(
              'Logout',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFFD0021B),
                fontFamily: 'Roboto',
              ),
            ),
            subtitle: const Text(
              'Sign out of your account',
              style: TextStyle(fontFamily: 'Roboto'),
            ),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              _showLogoutConfirmation();
            },
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text(
            'Logout',
            style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Roboto'),
          ),
          content: const Text(
            'Are you sure you want to logout?',
            style: TextStyle(fontFamily: 'Roboto'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Cancel',
                style: TextStyle(fontFamily: 'Roboto'),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.read<AuthBloc>().add(const LogoutEvent());
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD0021B),
                foregroundColor: Colors.white,
              ),
              child: const Text(
                'Logout',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Roboto',
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
