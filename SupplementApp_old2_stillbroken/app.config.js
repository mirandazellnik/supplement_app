export default {
  expo: {
    name: "SupplementApp",
    slug: "SupplementApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bluezone.bluezone",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "This app uses the camera to scan product barcodes and allow users to add supplements.",
        NSPhotoLibraryUsageDescription: "This app allows users to optionally select photos from their library.",
        NSMicrophoneUsageDescription: "This app may use the microphone if camera video recording is enabled."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.SupplementApp"
    },
    extra: {
      eas: {
        projectId: "9cde2422-8893-43c1-a275-fc7fad28afe8"
      }
    },
    plugins: ["expo-font"]
  }
}