import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Camera, CameraView } from "expo-camera";

const QRScanner: React.FC = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
    };
    requestPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    console.log(`Scanned [${type}]: ${data}`);
  };

  if (hasCameraPermission === null) {
    return <View />; // waiting for permission
  }

  if (hasCameraPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default QRScanner;
