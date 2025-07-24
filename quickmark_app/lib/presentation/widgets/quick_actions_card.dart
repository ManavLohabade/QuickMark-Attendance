import 'package:flutter/material.dart';

class QuickActionsCard extends StatelessWidget {
  final VoidCallback onMarkAttendance;
  final VoidCallback onViewHistory;
  final VoidCallback onViewProfile;
  final VoidCallback? onScanQR;

  const QuickActionsCard({
    super.key,
    required this.onMarkAttendance,
    required this.onViewHistory,
    required this.onViewProfile,
    this.onScanQR,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4, // card elevation from design.json
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(
          12,
        ), // card borderRadius from design.json
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.flash_on,
                  color: Color(0xFF4A90E2), // primaryColor from design.json
                  size: 24,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Quick Actions',
                  style: TextStyle(
                    fontSize: 20, // title fontSize from design.json
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF333333), // textColor from design.json
                    fontFamily: 'Roboto',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    'Face Scan',
                    Icons.face_outlined,
                    const Color(0xFF50E3C2), // accentColor from design.json
                    onMarkAttendance,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'QR Scan',
                    Icons.qr_code_scanner,
                    const Color(0xFF4A90E2), // primaryColor from design.json
                    onScanQR ?? () {},
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    'View History',
                    Icons.history,
                    const Color(0xFF8E8E93), // secondaryColor
                    onViewHistory,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    'View Profile',
                    Icons.person,
                    const Color(0xFF8E8E93), // secondaryColor
                    onViewProfile,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    String label,
    IconData icon,
    Color color,
    VoidCallback onPressed,
  ) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        elevation: 2,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(
            8,
          ), // button borderRadius from design.json
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 24, color: Colors.white),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              fontFamily: 'Roboto',
            ),
          ),
        ],
      ),
    );
  }
}
