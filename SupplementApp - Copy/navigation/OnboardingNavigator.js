// navigation/OnboardingNavigator.js
import React, {useState} from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GoalsScreen from "../screens/GoalsScreen";
import MedsScreen from "../screens/MedsScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import WelcomeScreen2 from "../screens/WelcomeScreen2";

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [meds, setMeds] = useState([]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/*<Stack.Screen name="WelcomePage">
        {(props) => (
          <WelcomeScreen
            {...props}
          />
        )}
      </Stack.Screen>*/}
      <Stack.Screen name="WelcomePage2">
        {(props) => (
          <WelcomeScreen2
            {...props}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="GoalsPage">
        {(props) => (
          <GoalsScreen
            {...props}
            selectedGoals={selectedGoals}
            setSelectedGoals={setSelectedGoals}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MedsPage">
        {(props) => (
          <MedsScreen
            {...props}
            meds={meds}
            setMeds={setMeds}
            selectedGoals={selectedGoals}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
