import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { login as apiLogin } from "../api/auth";
import { saveToken } from "../util/storage";
import { AuthContext } from "../navigation/AuthContext";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      await saveToken(data.access_token);
      await login(data.access_token, data.setup_complete);
    } catch (error) {
      Alert.alert("Login failed", error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Welcome Back</Text>
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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
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
  buttonText: { color: "#2575fc", fontWeight: "700", fontSize: 18 },
  linkContainer: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#fff", textDecorationLine: "underline", fontSize: 16 },
});
