import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      {/* Logout Button Top Right */}
      <View style={styles.topRight}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {/* Bottom Navigation */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate("MedsPage")}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRight: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  logoutButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 30, 
    textAlign: "center", 
    color: "#fff" 
  },
  goalButton: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  goalButtonSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  goalText: { fontSize: 16, color: "#fff" },
  goalTextSelected: { color: "#2575fc", fontWeight: "700" },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  nextButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: { color: "#2575fc", fontWeight: "700", fontSize: 16 },
});
