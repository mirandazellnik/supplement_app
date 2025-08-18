import React, { useState, useRef, useEffect, useContext } from "react";
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
import { login as apiLogin, register } from "../api/auth";
import { saveToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAlert } from "../contexts/AlertContext";

export default function RegisterScreen({ navigation, email }) {
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'firstName' | 'password' | null
  const { login } = useContext(AuthContext);
  
  const { showAlert } = useAlert();

  const firstNameAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(firstNameAnim, {
      toValue: focusedInput === "firstName" ? 1 : 0,
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
    if (!firstName || !password) {
      showAlert("Registration Failed", "Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      // Pass email as username to backend
      await register(email, firstName, password);
      const data = await apiLogin(email, password);
      await saveToken(data.access_token);
      await login(data.access_token, data.setup_complete);
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
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.gradient}>
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
        <Text style={styles.title}>Get Started</Text>

        {/* Info paragraph */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            We just need a little more information to set up your new account!
          </Text>
        </View>

        {/* Small label above first name box */}
        <Text style={styles.inputLabel}>First Name</Text>
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: interpolateBackground(firstNameAnim),
              shadowOpacity: firstNameAnim,
              shadowRadius: interpolateShadow(firstNameAnim),
            },
          ]}
        >
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#ddd"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => setFocusedInput("firstName")}
            onBlur={() => setFocusedInput(null)}
            cursorColor="#fff"
          />
        </Animated.View>

        {/* Small label above password box */}
        <Text style={styles.inputLabel}>New Password</Text>
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
            placeholder="New Password"
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
  buttonText: { color: "#2575fc", fontWeight: "700", fontSize: 18 },

  linkContainer: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#fff", textDecorationLine: "underline", fontSize: 16 },
});
