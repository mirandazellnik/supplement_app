import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabs from "./navigation/BottomTabs";
import AuthStack from "./navigation/AuthStack";
import OnboardingNavigator from "./navigation/OnboardingNavigator";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


function AppContent() {
  const { userToken, setupComplete } = useContext(AuthContext);

  if (userToken === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (!setupComplete ? <OnboardingNavigator /> : <BottomTabs />) : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AlertProvider>
    </GestureHandlerRootView>
  );
}
