import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { login as apiLogin } from "../api/auth";
import { saveToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import KeyboardScrollView from "../components/KeyboardScrollView";

export default function LoginScreen({ navigation, email }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const passwordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(passwordAnim, {
      toValue: focusedInput === "password" ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focusedInput]);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Login Failed", "Please enter your password!");
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      await saveToken(data.access_token);
      await login(data.access_token, data.setup_complete);
    } catch (error) {
      showAlert("Login failed", error.toString());
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
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.gradient}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <KeyboardScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome Back!</Text>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You've already used{" "}
            <Text style={styles.boldEmail}>{email}</Text>
            {" "}to sign in. Enter your password for that account.
          </Text>
        </View>

        {/* Password field */}
        <Text style={styles.inputLabel}>Password</Text>
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

        {/* Login button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Translucent Back button */}
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color="#fff"
            style={{ marginRight: 6, opacity: 0.9 }}
          />
          <Text style={styles.smallButtonText}>Back</Text>
        </TouchableOpacity>
      </KeyboardScrollView>
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

  infoBox: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 24,
  },
  boldEmail: {
    fontWeight: "bold",
    color: "#fff",
  },

  inputLabel: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "500",
    textAlign: "left",
    alignSelf: "flex-start",
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
  buttonText: {
    color: "#2575fc",
    fontWeight: "700",
    fontSize: 18,
  },

  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
