import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import InitialWelcome from "../screens/InitialWelcome";
import LoginEmailScreen from "../screens/LoginEmailScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InitialWelcome" component={InitialWelcome} />
      <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
      <Stack.Screen name="Login">
        {props => <LoginScreen {...props} email={props.route.params?.email}/>}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {props => <RegisterScreen {...props} email={props.route.params?.email}/>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
