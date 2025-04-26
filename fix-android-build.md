# Fix Android Build Issues

Follow these steps to fix the Android build issues:

## 1. Fix the Java Version Issue

### Option A: Install JDK 17 (Recommended)

1. Download and install JDK 17 from [Adoptium](https://adoptium.net/temurin/releases/?version=17)
2. Set JAVA_HOME environment variable to point to your JDK 17 installation:
   ```
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot" /M
   ```
   (Replace with your actual JDK path)

### Option B: Use an existing JDK installation

If you already have JDK 11 or higher installed, you can use that by updating the `gradle.properties` file:

1. Open `src-capacitor/android/gradle.properties`
2. Uncomment and update the Java home path:
   ```
   org.gradle.java.home=C:/Path/To/Your/JDK
   ```

## 2. Fix the Android SDK Version Issue

1. Open `src-capacitor/android/variables.gradle`
2. Make sure the SDK versions are set correctly:
   ```
   compileSdkVersion = 34
   targetSdkVersion = 34
   ```

## 3. Fix the Capacitor WebView Issue

1. Open `src-capacitor/node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java`
2. Replace the problematic code (around line 66) with:
   ```java
   // Android 15 (API 35) check - using hardcoded value since the constant isn't available yet
   if (Build.VERSION.SDK_INT >= 35 && configEdgeToEdge.equals("auto")) {
       try {
           TypedValue value = new TypedValue();
           // Try to resolve the attribute if it exists
           boolean foundOptOut = getContext().getTheme().resolveAttribute(
               // Using reflection since the attribute might not exist
               android.R.attr.class.getField("windowOptOutEdgeToEdgeEnforcement").getInt(null),
               value, 
               true
           );
           boolean optOutValue = value.data != 0;
           autoMargins = !(foundOptOut && optOutValue);
       } catch (Exception e) {
           // If the attribute doesn't exist, default to true for auto margins
           autoMargins = true;
       }
   }
   ```

## 4. Update Gradle Version

1. Open `src-capacitor/android/gradle/wrapper/gradle-wrapper.properties`
2. Make sure the Gradle version is compatible:
   ```
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.2.1-all.zip
   ```

## 5. Update Android Gradle Plugin

1. Open `src-capacitor/android/build.gradle`
2. Update the Android Gradle plugin version:
   ```
   classpath 'com.android.tools.build:gradle:8.2.2'
   ```

## 6. Clean and Rebuild

1. Delete the build directories:
   ```
   cd src-capacitor/android
   ./gradlew clean
   ```

2. Try building again:
   ```
   cd ../..
   quasar build -m capacitor -T android
   ```

## 7. Alternative: Build with Android Studio

If you still encounter issues, try building with Android Studio:

```
quasar build -m capacitor -T android --ide
```

This will open the project in Android Studio, where you can build it directly.

## 8. Check for Reflection Issues

If you encounter reflection-related errors, you might need to update the code in `CapacitorWebView.java` to:

```java
// Android 15 (API 35) check - using hardcoded value since the constant isn't available yet
if (Build.VERSION.SDK_INT >= 35 && configEdgeToEdge.equals("auto")) {
    // For Android 15+, always use auto margins since we can't reliably check the opt-out flag
    autoMargins = true;
}
```

## 9. Update compileSdkVersion in capacitor-android

If you encounter errors in the capacitor-android module, you might need to update its build.gradle file:

1. Find and open `src-capacitor/node_modules/@capacitor/android/capacitor/build.gradle`
2. Update the compileSdkVersion to match your project:
   ```
   android {
       compileSdkVersion 34
       // ...
   }
   ```

## 10. Check for Java Compatibility Issues

If you encounter Java compatibility issues, make sure all modules use the same Java version:

1. Add compileOptions to all build.gradle files that have an android section:
   ```
   compileOptions {
       sourceCompatibility JavaVersion.VERSION_17
       targetCompatibility JavaVersion.VERSION_17
   }
   ```
