import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductScreen from "../screens/ProductScreen";
import { Ionicons } from "@expo/vector-icons";
import QRScanner from "../screens/scanner";
import EssentialScreen from "../screens/EssentialScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props}/>}
      </Tab.Screen>
      <Tab.Screen name="Product" component={ProductScreen} />
      <Tab.Screen name="Essentials" component={EssentialScreen} />
      <Tab.Screen name="Scanner" component={QRScanner} />
    </Tab.Navigator>
  );
}
