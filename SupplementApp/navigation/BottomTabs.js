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

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Scanner") iconName = "barcode-outline"
          else if (route.name === "Search") iconName = "search-outline"

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      
      })}
    >
      {/*<Tab.Screen name="Home" component={HomeScreen} />*/}
      <Tab.Screen name="Home" options={{ headerShown: true }}component={NewHomeScreen}/>
      <Tab.Screen name="Scanner" options={{ headerShown: false }} component={ScannerStack}/>
      <Tab.Screen name="Profile" options={{ headerShown: true }}>
        {props => <ProfileScreen {...props}/>}
      </Tab.Screen>
      <Tab.Screen name="Search" options={{headerShown: false}} component={SearchProductsStack}/>
      {/*<Tab.Screen name="Product" component={ProductScreen} />*/}
      {/*<Tab.Screen name="Essentials" component={EssentialScreen} />*/}
      {/*<Tab.Screen name="Scanner" component={QRScanner} />*/}
      
      {/*<Tab.Screen name="New" component={NewScreen} />*/}
    </Tab.Navigator>
  );
}
