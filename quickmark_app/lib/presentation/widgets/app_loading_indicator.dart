import 'package:flutter/material.dart';

class AppLoadingIndicator extends StatelessWidget {
  final String? message;

  const AppLoadingIndicator({Key? key, this.message}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const CircularProgressIndicator(),
        if (message != null) ...[
          const SizedBox(height: 16),
          Text(
            message!,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, color: Colors.white70),
          ),
        ],
      ],
    );
  }
}
