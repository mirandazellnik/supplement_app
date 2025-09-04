import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { submitSetup } from "../api/user";
import { AuthContext } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";

export default function MedsScreen({ navigation, meds, setMeds, selectedGoals }) {
  const [input, setInput] = useState("");
  const { setSetupComplete, logout } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const addMed = () => {
    if (input.trim()) {
      setMeds([...meds, input.trim()]);
      setInput("");
    }
  };

  const removeMed = (med) => setMeds(meds.filter((m) => m !== med));

  const handleSubmit = async () => {
    try {
      await submitSetup({ goals: selectedGoals, meds });
      setSetupComplete(true);
    } catch (err) {
      console.log("Submit setup failed:", err);
      showAlert("Failed to submit. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      {/* Top-right logout */}
      <View style={styles.topRight}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Add Your Current Meds</Text>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Medication name"
              placeholderTextColor="#ddd"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={addMed}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Med List */}
          <FlatList
            data={meds}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => (
              <View style={styles.medItem}>
                <Text style={styles.medText}>{item}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMed(item)}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />

          {/* Fixed Bottom Buttons */}
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 100, // leave space below logout
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#fff",
    marginLeft: 10,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#2575fc",
    fontWeight: "700",
    fontSize: 20,
  },
  list: {
    flex: 1,
    width: "100%",
  },
  medItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10, // smaller than add button
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center", // vertically center text and button
  },
  medText: { color: "#fff", fontSize: 16 },
removeButton: {
  backgroundColor: "#ff6b6b",
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 6, // small padding to reduce height
  justifyContent: "center",
  alignItems: "center",
},
removeButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16, // smaller than the add button
},
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
  submitButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  submitButtonText: { color: "#2575fc", fontWeight: "700", fontSize: 16 },
});
