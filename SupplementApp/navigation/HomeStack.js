import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRScanner from "../screens/scanner";
//import ProductScreen as ProductModal from "../screens/ProductModal";
import EssentialScreen from "../screens/EssentialScreen";
import ProductScreen from "../screens/ProductScreen";
import HomeScreen from "../screens/NewHomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HeaderBackButton } from '@react-navigation/elements';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeAndScanner() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true,  animation: 'slide_from_bottom' }}>
      <Stack.Screen name="HomeScreen" options={{ headerShown:false, title: "Home" }} component={HomeScreen} />
      <Stack.Screen name="Barcode Scanner" component={QRScanner} options={{ headerShown: false, }} />
    </Stack.Navigator>
  );
}

function BeyondScanner( { navigation } ) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ProductScanner" component={ProductScreen} options={{
        headerLeft: (props) => (
          <HeaderBackButton
            {...props}
            onPress={() => navigation.goBack()}
          />
        ),
      }}  />
      <Stack.Screen name="EssentialScannerFromProductScanner" >
        {props => <EssentialScreen {...props} essentialName={props.route.params?.essentialName}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function JustEssentialScreen( { navigation, essentialName } ) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EssentialScanner" options={{
        headerLeft: (props) => (
          <HeaderBackButton
            {...props}
            onPress={() => navigation.goBack()}
          />
        ),
        headerShown: true,
      }}>
        {props => <EssentialScreen {...props} essentialName={essentialName} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}



export default function HomeStack( { navigation } ) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { display: "none" }, // hide tab bar
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeAndScanner" options={{ headerShown: false, tabBarStyle: { display: "none" } }} component={HomeAndScanner} />
      <Tab.Screen name="BeyondScanner" options={{ headerShown: false, tabBarStyle: { display: "none" } }} component={BeyondScanner} />
      <Tab.Screen name="JustEssentialScreen">
        {props => <JustEssentialScreen {...props} essentialName={props.route.params?.essentialName} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}