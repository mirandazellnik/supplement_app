import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRScanner from "../screens/scanner";
//import ProductScreen as ProductModal from "../screens/ProductModal";
import EssentialScreen from "../screens/EssentialScreen";
import ProductScreen from "../screens/ProductScreen";

const Stack = createNativeStackNavigator();

export default function ScannerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Barcode Scanner" component={QRScanner} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Essential">
        {props => <EssentialScreen {...props} essentialName={props.route.params?.essentialName} navigation={props.route.params?.navigation}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
