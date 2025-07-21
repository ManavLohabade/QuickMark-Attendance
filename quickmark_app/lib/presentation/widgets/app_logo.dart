import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const AppLogo({super.key, required this.size, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color ?? Theme.of(context).primaryColor,
      ),
      child: Center(
        child: Icon(
          Icons.qr_code_scanner,
          color: Colors.white,
          size: size * 0.6,
        ),
      ),
    );
  }
}
