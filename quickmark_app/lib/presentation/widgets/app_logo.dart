import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const AppLogo({Key? key, required this.size, this.color}) : super(key: key);

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
