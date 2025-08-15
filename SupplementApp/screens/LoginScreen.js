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
import { login as apiLogin } from "../api/auth";
import { saveToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAlert } from "../contexts/AlertContext";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'username' | 'password' | null
  const { login } = useContext(AuthContext);
  const { showAlert } = useAlert();

  // Animated values for background and shadow
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

  const handleLogin = async () => {
    if (!username || !password) {
      showAlert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      await saveToken(data.access_token);
      await login(data.access_token, data.setup_complete);
    } catch (error) {
      showAlert("Login failed", error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Interpolations
  const interpolateBackground = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.3)"],
    });

  const interpolateShadow = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8], // shadow radius
    });

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.gradient}>
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
        <Text style={styles.title}>Welcome Back</Text>

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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
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
  buttonText: { color: "#2575fc", fontWeight: "700", fontSize: 18 },

  linkContainer: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#fff", textDecorationLine: "underline", fontSize: 16 },
});
