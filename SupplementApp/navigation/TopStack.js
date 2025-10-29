import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TopProductsScreen from "../screens/TopProductsScreen"
//import ProductScreen as ProductModal from "../screens/ProductModal";
import EssentialScreen from "../screens/EssentialScreen";
import ProductScreen from "../screens/ProductScreen";

const Stack = createNativeStackNavigator();

export default function TopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Top Products" component={TopProductsScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Essential" options={{title:"Essential Ingredient"}}>
        {props => <EssentialScreen {...props} essentialHumanName={props.route.params?.essentialHumanName} essentialName={props.route.params?.essentialName} navigation={props.route.params?.navigation}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
