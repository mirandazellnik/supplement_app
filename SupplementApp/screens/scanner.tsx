import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, Text, BackHandler } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductScreen from "./ProductModal"; // import ProductScreen
import { useFocusEffect, useNavigation, useIsFocused } from "@react-navigation/native";

export default function QRScanner() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [upc, setUpc] = useState<string | null>(null);

  const [sheetIndex, setSheetIndex] = useState(-1); // -1 = closed
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "100%"], []);

  const isFocused = useIsFocused();

  // Request camera permission
  useEffect(() => {
    console.log("Requesting camera permission");
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

      // Push a dummy stack entry so back button targets modal first
      // navigation.push("QRScannerModalOpen");
    }
  };

  // Close BottomSheet & pop dummy navigation entry
  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    setScanned(false);

    if (navigation.canGoBack()) {
      //navigation.goBack(); // remove dummy route
    }
  }, [navigation]);

  // Track BottomSheet index
  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (sheetIndex >= 0) {
          handleCloseSheet(); // close modal first
          return true; // prevent default
        }
        return false; // allow normal back behavior (switch tab, etc.)
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

      <BottomSheet
        ref={sheetRef}
        index={-1} // initially closed
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleCloseSheet}
        onChange={handleSheetChange}
      >
        <ProductScreen upc={upc} sheetRef={sheetRef} />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
