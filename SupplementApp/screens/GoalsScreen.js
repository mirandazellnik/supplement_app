import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Button, StyleSheet, ScrollView } from "react-native";
import { AuthContext } from "../navigation/AuthContext";

const goalOptions = [
  "Longevity",
  "Emotional Regulation",
  "Strength",
  "Focus",
  "Sleep",
  "Weight Management",
];

export default function GoalsScreen({ navigation, selectedGoals, setSelectedGoals }) {
  const { logout } = useContext(AuthContext);

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Your Wellness Goals</Text>

      {goalOptions.map((goal) => (
        <TouchableOpacity
          key={goal}
          style={[
            styles.goalButton,
            selectedGoals.includes(goal) && styles.goalButtonSelected,
          ]}
          onPress={() => toggleGoal(goal)}
        >
          <Text
            style={[
              styles.goalText,
              selectedGoals.includes(goal) && styles.goalTextSelected,
            ]}
          >
            {goal}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navButtons}>
        <Button title="Next" onPress={() => navigation.navigate("MedsPage")} />
        <Button title="Logout" color="red" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  goalButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  goalButtonSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  goalText: { fontSize: 16 },
  goalTextSelected: { color: "white", fontWeight: "bold" },
  navButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});
