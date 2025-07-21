import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import 'app_logo.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return _buildAuthenticatedDrawer(context, state.user);
          } else {
            return _buildUnauthenticatedDrawer(context);
          }
        },
      ),
    );
  }

  Widget _buildAuthenticatedDrawer(BuildContext context, user) {
    return Column(
      children: [
        UserAccountsDrawerHeader(
          accountName: Text(user.name),
          accountEmail: Text(user.email),
          currentAccountPicture: user.photoUrl != null
              ? CircleAvatar(backgroundImage: NetworkImage(user.photoUrl!))
              : CircleAvatar(
                  backgroundColor: Theme.of(context).primaryColor,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S',
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
          decoration: BoxDecoration(color: Theme.of(context).primaryColor),
        ),
        ListTile(
          leading: const Icon(Icons.home),
          title: const Text('Home'),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushReplacementNamed(context, '/home');
          },
        ),
        ListTile(
          leading: const Icon(Icons.qr_code_scanner),
          title: const Text('Scan QR Code'),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/qr-scanner');
          },
        ),
        ListTile(
          leading: const Icon(Icons.person),
          title: const Text('Profile'),
          onTap: () {
            Navigator.pop(context);
            // Use placeholder for now
            Navigator.pushNamed(context, '/profile');
          },
        ),
        ListTile(
          leading: const Icon(Icons.settings),
          title: const Text('Settings'),
          onTap: () {
            Navigator.pop(context);
            // Use placeholder for now
            Navigator.pushNamed(context, '/settings');
          },
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.info_outline),
          title: const Text('About'),
          onTap: () {
            Navigator.pop(context);
            // Use placeholder for now
            Navigator.pushNamed(context, '/about');
          },
        ),
        const Spacer(),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.red),
          title: const Text('Logout', style: TextStyle(color: Colors.red)),
          onTap: () {
            Navigator.pop(context);
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('Logout'),
                content: const Text('Are you sure you want to logout?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      context.read<AuthBloc>().add(const LogoutEvent());
                    },
                    child: const Text('Logout'),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildUnauthenticatedDrawer(BuildContext context) {
    return Column(
      children: [
        Container(
          height: 170,
          padding: const EdgeInsets.all(20),
          color: Theme.of(context).primaryColor,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AppLogo(size: 80, color: Theme.of(context).primaryColor),
                const SizedBox(height: 12),
                const Text(
                  'QuickMark',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.login),
          title: const Text('Login'),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushReplacementNamed(context, '/login');
          },
        ),
        ListTile(
          leading: const Icon(Icons.info_outline),
          title: const Text('About'),
          onTap: () {
            Navigator.pop(context);
            // Use placeholder for now
            Navigator.pushNamed(context, '/about');
          },
        ),
      ],
    );
  }
}
