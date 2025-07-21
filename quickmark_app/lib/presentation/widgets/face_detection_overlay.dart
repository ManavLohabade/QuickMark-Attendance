import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

class FaceDetectionOverlay extends StatelessWidget {
  final List<Face> faces;
  final CameraController cameraController;

  const FaceDetectionOverlay({
    super.key,
    required this.faces,
    required this.cameraController,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: FaceDetectionPainter(
        faces: faces,
        cameraController: cameraController,
      ),
    );
  }
}

class FaceDetectionPainter extends CustomPainter {
  final List<Face> faces;
  final CameraController cameraController;

  FaceDetectionPainter({required this.faces, required this.cameraController});

  @override
  void paint(Canvas canvas, Size size) {
    if (!cameraController.value.isInitialized) return;

    final Paint paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..color = const Color(0xFF50E3C2); // accentColor from design.json

    final Paint fillPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF50E3C2).withOpacity(0.1);

    // Get camera preview size
    final cameraSize = cameraController.value.previewSize!;
    final scaleX = size.width / cameraSize.height;
    final scaleY = size.height / cameraSize.width;

    for (final Face face in faces) {
      // Convert face bounds to screen coordinates
      final Rect faceRect = Rect.fromLTRB(
        face.boundingBox.left * scaleX,
        face.boundingBox.top * scaleY,
        face.boundingBox.right * scaleX,
        face.boundingBox.bottom * scaleY,
      );

      // Draw face bounding box
      canvas.drawRect(faceRect, fillPaint);
      canvas.drawRect(faceRect, paint);

      // Draw corner brackets for better visual indication
      _drawCornerBrackets(canvas, faceRect, paint);

      // Draw face landmarks if available
      if (face.landmarks.isNotEmpty) {
        _drawFaceLandmarks(canvas, face.landmarks, scaleX, scaleY, paint);
      }
    }

    // Draw center guide
    _drawCenterGuide(canvas, size);
  }

  void _drawCornerBrackets(Canvas canvas, Rect rect, Paint paint) {
    const double bracketLength = 20.0;
    const double bracketThickness = 4.0;

    final Paint bracketPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = bracketThickness
      ..color = const Color(0xFF50E3C2)
      ..strokeCap = StrokeCap.round;

    // Top-left corner
    canvas.drawLine(
      Offset(rect.left, rect.top + bracketLength),
      Offset(rect.left, rect.top),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(rect.left, rect.top),
      Offset(rect.left + bracketLength, rect.top),
      bracketPaint,
    );

    // Top-right corner
    canvas.drawLine(
      Offset(rect.right - bracketLength, rect.top),
      Offset(rect.right, rect.top),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(rect.right, rect.top),
      Offset(rect.right, rect.top + bracketLength),
      bracketPaint,
    );

    // Bottom-left corner
    canvas.drawLine(
      Offset(rect.left, rect.bottom - bracketLength),
      Offset(rect.left, rect.bottom),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(rect.left, rect.bottom),
      Offset(rect.left + bracketLength, rect.bottom),
      bracketPaint,
    );

    // Bottom-right corner
    canvas.drawLine(
      Offset(rect.right - bracketLength, rect.bottom),
      Offset(rect.right, rect.bottom),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(rect.right, rect.bottom),
      Offset(rect.right, rect.bottom - bracketLength),
      bracketPaint,
    );
  }

  void _drawFaceLandmarks(
    Canvas canvas,
    Map<FaceLandmarkType, FaceLandmark?> landmarks,
    double scaleX,
    double scaleY,
    Paint paint,
  ) {
    final Paint landmarkPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF50E3C2);

    landmarks.forEach((type, landmark) {
      if (landmark != null) {
        final scaledPoint = Offset(
          landmark.position.x * scaleX,
          landmark.position.y * scaleY,
        );
        canvas.drawCircle(scaledPoint, 3.0, landmarkPaint);
      }
    });
  }

  void _drawCenterGuide(Canvas canvas, Size size) {
    final Paint guidePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0
      ..color = Colors.white.withOpacity(0.5);

    final centerX = size.width / 2;
    final centerY = size.height / 2;
    const guideSize = 100.0;

    // Draw center crosshair
    canvas.drawLine(
      Offset(centerX - guideSize / 2, centerY),
      Offset(centerX + guideSize / 2, centerY),
      guidePaint,
    );
    canvas.drawLine(
      Offset(centerX, centerY - guideSize / 2),
      Offset(centerX, centerY + guideSize / 2),
      guidePaint,
    );

    // Draw center circle
    canvas.drawCircle(Offset(centerX, centerY), guideSize / 3, guidePaint);
  }

  @override
  bool shouldRepaint(FaceDetectionPainter oldDelegate) {
    return oldDelegate.faces != faces;
  }
}
