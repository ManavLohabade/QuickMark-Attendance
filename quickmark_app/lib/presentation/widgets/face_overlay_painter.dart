import 'package:flutter/material.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

class FaceOverlayPainter extends CustomPainter {
  final Face? face;
  final Size imageSize;
  final InputImageRotation rotation;
  final bool isFaceDetected;

  FaceOverlayPainter({
    this.face,
    required this.imageSize,
    required this.rotation,
    required this.isFaceDetected,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (face == null) {
      _drawGuideOval(canvas, size, isFaceDetected);
      return;
    }

    final Paint paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..color = isFaceDetected ? Colors.green : Colors.red;

    // Calculate scale factors
    final double scaleX = size.width / imageSize.width;
    final double scaleY = size.height / imageSize.height;

    // Transform face bounding box to canvas coordinates
    final Rect faceRect = _transformRect(
      rect: face!.boundingBox,
      imageSize: imageSize,
      widgetSize: size,
      rotation: rotation,
    );

    // Draw face bounding box or oval guide
    if (isFaceDetected) {
      canvas.drawRect(faceRect, paint);

      // Draw facial landmarks if available
      _drawLandmarks(canvas, size, scaleX, scaleY, paint);
    } else {
      _drawGuideOval(canvas, size, isFaceDetected);
    }

    // Draw instruction text
    _drawInstructions(canvas, size, isFaceDetected);
  }

  void _drawLandmarks(
    Canvas canvas,
    Size size,
    double scaleX,
    double scaleY,
    Paint paint,
  ) {
    if (face == null || face!.landmarks.isEmpty) return;

    final Paint landmarkPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = Colors.blue
      ..strokeWidth = 3.0;

    // Draw specific landmarks like eyes, nose, mouth if available
    face!.landmarks.forEach((type, landmark) {
      if (landmark != null) {
        final scaledPoint = Offset(
          landmark.position.x * scaleX,
          landmark.position.y * scaleY,
        );
        canvas.drawCircle(scaledPoint, 4.0, landmarkPaint);
      }
    });
  }

  void _drawGuideOval(Canvas canvas, Size size, bool isFaceDetected) {
    final Paint guidePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..color = isFaceDetected ? Colors.green : Colors.white;

    // Draw an oval guide in the center of the canvas
    final Rect guideRect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2.5),
      width: size.width * 0.65,
      height: size.height * 0.45,
    );

    canvas.drawOval(guideRect, guidePaint);
  }

  void _drawInstructions(Canvas canvas, Size size, bool isFaceDetected) {
    final TextPainter textPainter = TextPainter(
      text: TextSpan(
        text: isFaceDetected
            ? 'Face Detected'
            : 'Position your face in the oval',
        style: TextStyle(
          color: isFaceDetected ? Colors.green : Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );

    textPainter.layout(maxWidth: size.width * 0.8);

    textPainter.paint(
      canvas,
      Offset((size.width - textPainter.width) / 2, size.height * 0.7),
    );
  }

  Rect _transformRect({
    required Rect rect,
    required Size imageSize,
    required Size widgetSize,
    required InputImageRotation rotation,
  }) {
    final double scaleX = widgetSize.width / imageSize.width;
    final double scaleY = widgetSize.height / imageSize.height;

    // Handle different rotations (simplified)
    switch (rotation) {
      case InputImageRotation.rotation90deg:
        return Rect.fromLTRB(
          widgetSize.width - rect.bottom * scaleX,
          rect.left * scaleY,
          widgetSize.width - rect.top * scaleX,
          rect.right * scaleY,
        );
      case InputImageRotation.rotation270deg:
        return Rect.fromLTRB(
          rect.top * scaleX,
          widgetSize.height - rect.right * scaleY,
          rect.bottom * scaleX,
          widgetSize.height - rect.left * scaleY,
        );
      case InputImageRotation.rotation180deg:
        return Rect.fromLTRB(
          widgetSize.width - rect.right * scaleX,
          widgetSize.height - rect.bottom * scaleY,
          widgetSize.width - rect.left * scaleX,
          widgetSize.height - rect.top * scaleY,
        );
      case InputImageRotation.rotation0deg:
        return Rect.fromLTRB(
          rect.left * scaleX,
          rect.top * scaleY,
          rect.right * scaleX,
          rect.bottom * scaleY,
        );
    }
  }

  @override
  bool shouldRepaint(FaceOverlayPainter oldDelegate) {
    return oldDelegate.face != face ||
        oldDelegate.isFaceDetected != isFaceDetected ||
        oldDelegate.imageSize != imageSize;
  }
}
