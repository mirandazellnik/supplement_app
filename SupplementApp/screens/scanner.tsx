import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, Text, BackHandler, StyleSheet } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductScreen from "./ProductModal"; // import ProductScreen
import { useFocusEffect, useNavigation, useIsFocused } from "@react-navigation/native";

export default function QRScanner({navigation}) {
  const insets = useSafeAreaInsets();
  //const navigation = useNavigation();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [upc, setUpc] = useState<string | null>(null);

  const [sheetIndex, setSheetIndex] = useState(-1); // -1 = closed
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "100%"], []);

  const isFocused = useIsFocused();

  // Request camera permission
  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(res => {
      setHasCameraPermission(res.status === "granted");
    });
  }, []);

  // Handle barcode scanned
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      setUpc(data);
      sheetRef.current?.snapToIndex(0);
    }
  };

  // Close BottomSheet
  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    setScanned(false);
  }, []);

  // Track BottomSheet index
  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (sheetIndex >= 0) {
          handleCloseSheet();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [sheetIndex, handleCloseSheet])
  );

  if (hasCameraPermission === null) return <View style={{ flex: 1 }} />;
  if (hasCameraPermission === false)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No camera permission</Text>
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isFocused && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
          style={{ flex: 1 }}
        />
      )}

      {/* Dim overlay when scanned */}
      {scanned && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)', // 50% dim
          }}
          pointerEvents="none" // allow touches to pass through if needed
        />
      )}

      {/* Overlay rectangle + text */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={[styles.rectangle, {borderColor: !scanned ? "white" : "grey"}]} />
        <Text style={[styles.overlayText, {color: !scanned ? "white" : "grey"}]}>{!scanned ? "Align barcode here" : "Barcode scanned!"}</Text>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleCloseSheet}
        onChange={handleSheetChange}
      >
        <ProductScreen upc={upc} sheetRef={sheetRef} navigation={navigation}/>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  rectangle: {
    width: "70%",   // takes 70% of screen width
    aspectRatio: 1.5, // keeps rectangle proportional (width:height)
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  overlayText: {
    marginTop: 12,
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
