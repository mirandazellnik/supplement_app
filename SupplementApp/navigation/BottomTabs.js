import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ProfileScreen from "../screens/ProfileScreen";
import SearchProductsStack from "../navigation/SearchProductsStack"
import HomeStack from "./HomeStack";
import PersonalRecommendations from "../screens/PersonalRecommendations";
import TopProductsScreen from "../screens/TopProductsScreen";
import TopStack from "./TopStack";

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
        case "Top":
          iconName = focused ? "podium" : "podium-outline";
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
    return {  headerShown: false };
      }}
    />

      {/*<Tab.Screen name="Scanner" options={{ headerShown: false }} component={ScannerStack}/>*/}
      <Tab.Screen name="Search" options={{headerShown: false}} component={SearchProductsStack}/>
      <Tab.Screen name="Top" options={{headerShown: false}} component={TopStack} />
      <Tab.Screen name="Profile" options={{ headerShown: true, title: "Account" }}>
        {props => <ProfileScreen {...props}/>}
      </Tab.Screen>
      {/*<Tab.Screen name="Personal Recommendations" options={{ headerShown: true }} component={PersonalRecommendations}/>*/}
      {/*<Tab.Screen name="Product" component={ProductScreen} />*/}
      {/*<Tab.Screen name="Essentials" component={EssentialScreen} />*/}
      {/*<Tab.Screen name="Scanner" component={QRScanner} />*/}
      
      {/*<Tab.Screen name="New" component={NewScreen} />*/}
    </Tab.Navigator>
  );
}
