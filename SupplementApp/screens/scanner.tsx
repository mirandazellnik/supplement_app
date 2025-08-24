import React, { useState, useEffect, useRef } from "react";
import { View, Dimensions, Animated, PanResponder, Vibration, StyleSheet } from "react-native";
import { Camera, CameraView } from "expo-camera";
import ProductScreen from "./ProductHalf";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const QRScanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 60 + insets.bottom;
  const FULL_HEIGHT = height - TAB_HEIGHT;
  const PEEK_HEIGHT = 120;

  const [hasCameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isScanningEnabled, setIsScanningEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const sheetAnim = useRef(new Animated.Value(FULL_HEIGHT)).current;
  const gestureStartY = useRef(0);
  const scrollOffset = useRef(0);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermission.status === "granted");
    };
    requestPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (!isScanningEnabled) return;
    Vibration.vibrate();
    setScannedBarcode(data);
    setIsScanningEnabled(false);

    Animated.spring(sheetAnim, {
      toValue: FULL_HEIGHT - PEEK_HEIGHT,
      useNativeDriver: true,
      bounciness: 6,
    }).start(() => setIsExpanded(false));
  };

  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only let ScrollView handle gestures if sheet fully expanded AND scrollOffset > 0
        return sheetAnim._value > 0 || scrollOffset.current <= 0;
      },
      onPanResponderGrant: () => {
        gestureStartY.current = sheetAnim._value;
      },
      onPanResponderMove: (_, gesture) => {
        let newY = gestureStartY.current + gesture.dy * 0.5; // smooth, sensitive drag
        newY = Math.max(0, Math.min(FULL_HEIGHT, newY));
        sheetAnim.setValue(newY);
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = FULL_HEIGHT / 5; // smaller threshold
        if (sheetAnim._value < threshold) {
          // Fully expand
          Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start(() => setIsExpanded(true));
        } else if (sheetAnim._value < FULL_HEIGHT - PEEK_HEIGHT / 2) {
          // Peek
          Animated.spring(sheetAnim, { toValue: FULL_HEIGHT - PEEK_HEIGHT, useNativeDriver: true, bounciness: 6 }).start(() => setIsExpanded(false));
        } else {
          // Collapse completely
          Animated.timing(sheetAnim, { toValue: FULL_HEIGHT, duration: 200, useNativeDriver: true }).start(() => {
            setIsScanningEnabled(true);
            setScannedBarcode(null);
            setIsExpanded(false);
          });
        }
      },
    })
  ).current;

  if (!hasCameraPermission) return null;

  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [FULL_HEIGHT - PEEK_HEIGHT, FULL_HEIGHT],
    outputRange: [0.3, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        onBarcodeScanned={isScanningEnabled ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
        style={{ flex: 1 }}
      />

      {/* Darkened overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "black", opacity: overlayOpacity }]}
      />

      {/* Bottom sheet */}
      <Animated.View
        {...sheetPanResponder.panHandlers}
        style={[
          styles.sheet,
          {
            height: FULL_HEIGHT,
            transform: [{ translateY: sheetAnim }],
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        ]}
      >
        <ProductScreen
          barcode={scannedBarcode}
          isExpanded={sheetAnim._value <= FULL_HEIGHT - PEEK_HEIGHT}
          scrollOffsetRef={scrollOffset}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    overflow: "hidden",
  },
});

export default QRScanner;
