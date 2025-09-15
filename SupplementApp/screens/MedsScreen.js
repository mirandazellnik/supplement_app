import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { submitSetup } from "../api/user";
import { AuthContext } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedsScreen({ navigation, meds, setMeds, selectedGoals }) {
  const [input, setInput] = useState("");
  const [focusedInput, setFocusedInput] = useState(false);
  const { setSetupComplete, logout } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: focusedInput ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focusedInput]);

  const interpolateBackground = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.3)"],
  });

  const interpolateShadow = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

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
      <SafeAreaView style={{ flex: 1 }}>
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
            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: interpolateBackground,
                  shadowOpacity: inputAnim,
                  shadowRadius: interpolateShadow,
                },
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Medication name"
                placeholderTextColor="#ddd"
                value={input}
                onChangeText={setInput}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                cursorColor="#fff"
              />
            </Animated.View>
            <TouchableOpacity style={styles.addButton} onPress={addMed}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          

          {/* Scrollable Med List */}
          {meds.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "top" }}>
              <Text style={styles.smallText}>Enter the name of a medication and click the + button to add it.</Text>
            </View>
          ) : (
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
          /> )}

          {/* Fixed Bottom Buttons */}
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {meds.length > 0 ? "Submit" : "Skip"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
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
    height: 40,
    justifyContent: "center",
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  smallText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40, // leave space below logout
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
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  input: {
    color: "#fff",
    padding: 15,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  addButton: {
    backgroundColor: "#fff",
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  medText: { color: "#fff", fontSize: 16 },
  removeButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
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
