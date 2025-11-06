import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
//import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAlert } from "../contexts/AlertContext";
import { check_whether_user_exists } from "../api/auth";
import KeyboardScrollView from "../components/KeyboardScrollView";
 
export default function LoginEmailScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // 'email' | null
  const { showAlert } = useAlert();

  // Animated values for background and shadow
  const emailAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(emailAnim, {
      toValue: focusedInput === "email" ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focusedInput]);

  const handleContinue = async () => {
    if (!email) {
      showAlert("Missing Email", "Please enter your email address!");
      return;
    }
    setLoading(true);
    try {
      exists = await check_whether_user_exists(email);
      if (!exists) {
        navigation.navigate("Register", { email, setEmail });
      } else {
        navigation.navigate("Login", { email, setEmail });
      }
    } catch (error) {
      showAlert("Error", error.toString());
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

      <KeyboardScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Get Started</Text>

        {/* Small label above email box */}
        <Text style={styles.inputLabel}>Email</Text>
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: interpolateBackground(emailAnim),
              shadowOpacity: emailAnim,
              shadowRadius: interpolateShadow(emailAnim),
            },
          ]}
        >
          <TextInput
            placeholder="Email"
            placeholderTextColor="#ddd"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            cursorColor="#fff"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animated.View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Continuing..." : "Continue"}
          </Text>
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
});
