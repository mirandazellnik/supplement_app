import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, Text, BackHandler, StyleSheet } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, {BottomSheetBackdrop} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProductScreen from "./ProductModal"; // import ProductScreen
import { useFocusEffect, useNavigation, useIsFocused } from "@react-navigation/native";

import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSharedValue } from 'react-native-reanimated';

import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher'; // Android settings shortcut
import { Platform } from "react-native";

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

  const [sheetVisible, setSheetVisible] = useState(true);

  const [alreadyData, setAlreadyData] = useState(false);

  const sharedSheetIndex = useSharedValue(0);


  useFocusEffect(
    React.useCallback(() => {
      // Hide the bottom tab bar
      navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    }, [navigation])
  );

  useFocusEffect(
    useCallback(() => {
      Camera.getCameraPermissionsAsync().then(({ status }) => {
        setHasCameraPermission(status === 'granted');
      });
    }, [])
  );


  const openDeeperProduct = (screen, params) => {
    //setSheetVisible(false); // hide BottomSheet
    //sheetRef.current?.snapToIndex(-1); // close BottomSheet
    //setAlreadyData(true);

    navigation.navigate("BeyondScanner", {screen, params});
  };

  /*
  useEffect(() => {
    console.log("Scanner screen focused:", isFocused);
    if (isFocused && alreadyData) {
      // If returning to scanner and already viewed a product, reset
      console.log("Resetting scanner state");
      sheetRef.current?.snapToIndex(1); // open BottomSheet fully
      setAlreadyData(false);
    }
  }, [isFocused]);*/

  // Request camera permission
  useEffect(() => {
  const requestPermission = async () => {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();

    // ✅ If already granted, we’re done
    
    if (status === "granted") {
      setHasCameraPermission(true);
      return;
    }

    // ✅ Early return — don't show alert if user can still be prompted by system dialog
    if (status === "denied" && canAskAgain) {
      // The OS will handle showing the permission dialog again automatically
      setHasCameraPermission(false);
      return;
    }

    // ❌ If permanently denied (can't ask again) → show alert
    setHasCameraPermission(false);

    Alert.alert(
      Platform.OS === "ios" ? "Enable Camera Access in Settings" : "Camera Permission Needed",
      Platform.OS === "ios"
        ? "Go to Settings → Privacy → Camera and enable access for this app."
        : "Please grant camera access to scan barcodes.",
      [
        {
          text: Platform.OS === "ios" ? "Open Settings" : "Grant Access",
          onPress: async () => {
            if (Platform.OS === "ios") {
              await Linking.openURL("app-settings:");
            } else {
              const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
              if (newStatus === "granted") setHasCameraPermission(true);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  requestPermission();
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
    sharedSheetIndex.value = index;
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
  if (hasCameraPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Top-right Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 20, zIndex: 0 }]} // safe area + margin
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ marginBottom: 10, color: 'black' }}>
          Camera permission is required to scan barcodes.
        </Text>
        <TouchableOpacity
          onPress={() => {
            // Retry permission check if they come back from Settings
            Camera.requestCameraPermissionsAsync().then(res => {
              if (res.status === 'granted') setHasCameraPermission(true);
            });
          }}
          style={{
            backgroundColor: '#007AFF',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor:"black" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
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

      {/* Top-right Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 20, zIndex: 0 }]} // safe area + margin
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {(
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleCloseSheet}
        onChange={handleSheetChange}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="none" disappearsOnIndex={-1} />
        )}
      >
        <ProductScreen upc={upc} sheetRef={sheetRef} navigation={navigation} openDeeperProduct={openDeeperProduct} sharedSheetIndex={sharedSheetIndex} />
      </BottomSheet>
      )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)", // semi-transparent background
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
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
