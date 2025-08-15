import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { register } from "../api/auth";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await register(username, password);
      Alert.alert("Success", "User registered! Please login.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Registration failed", error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#ff512f", "#dd2476"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#ddd"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 30 },
  title: { fontSize: 34, fontWeight: "700", color: "#fff", marginBottom: 40, textAlign: "center" },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  buttonText: { color: "#dd2476", fontWeight: "700", fontSize: 18 },
  linkContainer: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#fff", textDecorationLine: "underline", fontSize: 16 },
});
