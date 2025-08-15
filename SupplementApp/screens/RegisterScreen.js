import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { register } from "../api/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAlert } from "../contexts/AlertContext";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'username' | 'password' | null

  const { showAlert } = useAlert();

  const usernameAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  

  useEffect(() => {
    Animated.timing(usernameAnim, {
      toValue: focusedInput === "username" ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focusedInput]);

  useEffect(() => {
    Animated.timing(passwordAnim, {
      toValue: focusedInput === "password" ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focusedInput]);

  const handleRegister = async () => {
    if (!username || !password) {
      showAlert("Registration Failed", "Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      await register(username, password);
      showAlert("Success", "User registered! Please login.");
      navigation.navigate("Login");
    } catch (error) {
      showAlert("Registration failed", error.toString());
    } finally {
      setLoading(false);
    }
  };

  const interpolateBackground = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.3)"],
    });

  const interpolateShadow = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    });

  return (
    <LinearGradient colors={["#ff512f", "#dd2476"]} style={styles.gradient}>
      {/* Logo fixed top-left */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>

        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: interpolateBackground(usernameAnim),
              shadowOpacity: usernameAnim,
              shadowRadius: interpolateShadow(usernameAnim),
            },
          ]}
        >
          <TextInput
            placeholder="Username"
            placeholderTextColor="#ddd"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            onFocus={() => setFocusedInput("username")}
            onBlur={() => setFocusedInput(null)}
            cursorColor="#fff"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: interpolateBackground(passwordAnim),
              shadowOpacity: passwordAnim,
              shadowRadius: interpolateShadow(passwordAnim),
            },
          ]}
        >
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ddd"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            cursorColor="#fff"
          />
        </Animated.View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  logoContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 30,
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 40,
    tintColor: "#fff",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },

  inputWrapper: {
    borderRadius: 12,
    marginBottom: 20,
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
