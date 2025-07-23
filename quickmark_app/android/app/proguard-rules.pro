# Flutter and general rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Google Play Core Library - MORE COMPREHENSIVE
-keep class com.google.android.play.core.** { *; }
-keep interface com.google.android.play.core.** { *; }
-keep enum com.google.android.play.core.** { *; }

# Specific Google Play Core splitinstall and tasks rules
-keep class com.google.android.play.core.splitinstall.** { *; }
-keep class com.google.android.play.core.splitcompat.** { *; }
-keep class com.google.android.play.core.tasks.** { *; }

# TensorFlow Lite and ML Kit rules - MORE COMPREHENSIVE
-keep class org.tensorflow.lite.** { *; }
-keep interface org.tensorflow.lite.** { *; }
-keep enum org.tensorflow.lite.** { *; }
-keep public class com.google.firebase.ml.** { *; }
-keep class com.google.mlkit.** { *; }

# Specific TensorFlow Lite GPU delegate rules
-keep class org.tensorflow.lite.gpu.** { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory$Options { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegate { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegate$Options { *; }

# Rules for common dependencies used by ML Kit
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.mediapipe.** { *; }
-keep class com.google.protobuf.** { *; }
-keepclassmembers class * extends com.google.protobuf.GeneratedMessageLite {
    <fields>;
    <methods>;
}

# Additional Flutter deferred components rules
-keep class io.flutter.embedding.engine.deferredcomponents.** { *; }
-keep class io.flutter.embedding.android.FlutterPlayStoreSplitApplication { *; }

# Prevent R8 from being too aggressive with reflection
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Camera and Image processing rules
-keep class androidx.camera.** { *; }
-keep class * implements java.io.Serializable { *; }

# Additional R8 safety rules for dynamic features
-dontwarn com.google.android.play.core.splitcompat.**
-dontwarn com.google.android.play.core.splitinstall.**
-dontwarn com.google.android.play.core.tasks.**
-dontwarn org.tensorflow.lite.gpu.**

# Keep all classes that might be loaded dynamically
-keepnames class * {
    public static void main(java.lang.String[]);
}

# Keep native method names and their classes
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}