import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRScanner from "../screens/scanner";
//import ProductScreen as ProductModal from "../screens/ProductModal";
import EssentialScreen from "../screens/EssentialScreen";
import ProductScreen from "../screens/ProductScreen";
import SearchScreen from "../screens/SearchScreen";

const Stack = createNativeStackNavigator();

export default function SearchProductsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Search Products" component={SearchScreen} />
      <Stack.Screen name="Product" >
        {props => <ProductScreen {...props} id={props.route.params?.id} name={props.route.params?.name} brand={props.route.params?.brand}/>}
      </Stack.Screen>
      <Stack.Screen name="Essential">
        {props => <EssentialScreen {...props} essentialName={props.route.params?.essentialName} navigation={props.route.params?.navigation}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
