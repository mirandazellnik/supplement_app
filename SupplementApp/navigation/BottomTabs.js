import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductScreen from "../screens/ProductScreen";
import { Ionicons } from "@expo/vector-icons";
import QRScanner from "../screens/scanner";
import EssentialScreen from "../screens/EssentialScreen";
import NewScreen from "../screens/NewScreen";
import ScannerStack from "./ScannerStack";
import NewHomeScreen from "../screens/NewHomeScreen";
import SearchScreen from "../screens/SearchScreen";
import SearchProductsStack from "../navigation/SearchProductsStack"
import HomeStack from "./HomeStack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

function getDeepestRouteName(route) {
  let currentRoute = route;

  while (currentRoute.state && currentRoute.state.index !== undefined) {
    const index = currentRoute.state.index;
    currentRoute = currentRoute.state.routes[index];
  }

  return currentRoute.name ?? route.name;
}

const Tab = createBottomTabNavigator();
//options={{ headerShown: false }}
export default function BottomTabs() {
  return (
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size, focused }) => {
      let iconName;

      switch (route.name) {
        case "Home":
          iconName = focused ? "home" : "home-outline";
          break;
        case "Profile":
          iconName = focused ? "person" : "person-outline";
          break;
        case "Scanner":
          iconName = focused ? "barcode" : "barcode-outline";
          break;
        case "Search":
          iconName = focused ? "search" : "search-outline";
          break;
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: "#29f",
    tabBarInactiveTintColor: "#000",
  })}>



    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={({ route }) => {
    const focusedRouteName = getDeepestRouteName(route);
    console.log("->>>>> REAL FOCUSED ROUTE NAME:", focusedRouteName);

    // Hide tab bar for these screens
    const hideTabBarScreens = ["Barcode Scanner", "ProductScanner", "EssentialScanner"];
    const tabBarStyle = hideTabBarScreens.includes(focusedRouteName)
      ? { display: "none" }
      : undefined;

    return {  headerShown: false };
  }}
/>

      {/*<Tab.Screen name="Scanner" options={{ headerShown: false }} component={ScannerStack}/>*/}
      <Tab.Screen name="Search" options={{headerShown: false}} component={SearchProductsStack}/>
      <Tab.Screen name="Profile" options={{ headerShown: true }}>
        {props => <ProfileScreen {...props}/>}
      </Tab.Screen>
      {/*<Tab.Screen name="Product" component={ProductScreen} />*/}
      {/*<Tab.Screen name="Essentials" component={EssentialScreen} />*/}
      {/*<Tab.Screen name="Scanner" component={QRScanner} />*/}
      
      {/*<Tab.Screen name="New" component={NewScreen} />*/}
    </Tab.Navigator>
  );
}
