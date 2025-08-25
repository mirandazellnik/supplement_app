import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../components/StarRating";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lookup } from "../api/supplements";


const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function QRScanner() {
  const insets = useSafeAreaInsets();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastOffset = useRef(SCREEN_HEIGHT);

  // Sample product
  const product = {
    name: "Super Immune Boost",
    image: require("../assets/images/vitamin-c.png"),
    rating: 4.4,
  };

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(res => {
      setHasCameraPermission(res.status === "granted");
    });
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);

      let x = await lookup(data); // Lookup product by UPC
      console.log("Lookup result:", x);

      // Show modal
      Animated.timing(panY, {
        toValue: 0, // fully visible
        duration: 300,
        useNativeDriver: true,
      }).start(() => lastOffset.current = 0);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drag
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => panY.setOffset(lastOffset.current),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) return; // prevent dragging up
        panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        if (gestureState.dy > 50) {
          // Dragged down → close modal
          Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setScanned(false));
          lastOffset.current = SCREEN_HEIGHT;
        } else {
          // Snap back to bottom
          Animated.timing(panY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => lastOffset.current = 0);
        }
      },
    })
  ).current;

  if (hasCameraPermission === null) return <View style={{ flex: 1 }} />;
  if (hasCameraPermission === false)
    return (
      <View style={styles.center}>
        <Text>No camera permission</Text>
      </View>
    );

  // Modal height: only enough to show title, stars, image, buy button
  const MODAL_HEIGHT = 160;

  return (
    <View style={{ flex: 1 }}>
      {/* Camera */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Modal */}
      {scanned && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modal,
            {
              height: MODAL_HEIGHT + insets.bottom,
              transform: [{ translateY: panY }],
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View style={styles.topRow}>
            <Image source={product.image} style={styles.productImage} />
            <View style={styles.titleStarsContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.starsAndButtonRow}>
                <StarRating rating={product.rating} size={20} gap={2} />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
                <TouchableOpacity style={styles.purchaseIconButton}>
                  <Ionicons name="cart-outline" size={24} color={colors.primary} />
                  <Text style={styles.buyText}>BUY</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    zIndex: 1000,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  productImage: { width: 70, height: 70, borderRadius: 16, marginRight: spacing.md, backgroundColor: colors.surface },
  titleStarsContainer: { flex: 1, flexDirection: "column", justifyContent: "center" },
  productName: { ...typography.h2, color: colors.textPrimary, fontWeight: "bold", marginBottom: 4 },
  starsAndButtonRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 12 },
  ratingText: { color: colors.textSecondary, fontSize: 16, fontWeight: "500", marginLeft: 4 },
  purchaseIconButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginLeft: 12, elevation: 2 },
  buyText: { color: colors.primary, fontWeight: "bold", fontSize: 16, marginLeft: 6 },
});
