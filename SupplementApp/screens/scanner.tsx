import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, Text } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductScreen from "./ProductModal"; // import ProductScreen

export default function QRScanner() {
  const insets = useSafeAreaInsets();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [upc, setUpc] = useState<string | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "100%"], []);

  // Request camera permission
  React.useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(res => {
      setHasCameraPermission(res.status === "granted");
    });
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      //setUpc(data);
      setUpc("863897000085")
      sheetRef.current?.snapToIndex(0);
    }
  };

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    setScanned(false);
  }, []);

  if (hasCameraPermission === null) return <View style={{ flex: 1 }} />;
  if (hasCameraPermission === false)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No camera permission</Text>
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
        style={{ flex: 1 }}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1} // initially closed
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleCloseSheet}
      >
        {/* Render the full ProductScreen inside the BottomSheet */}
        <ProductScreen upc={upc} />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
