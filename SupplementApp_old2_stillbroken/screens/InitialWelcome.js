import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function InitialWelcome({ navigation }) {
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeSlide = useRef(new Animated.Value(30)).current;

  const toBlueOpacity = useRef(new Animated.Value(0)).current;
  const toBlueSlide = useRef(new Animated.Value(30)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate "Welcome"
    Animated.timing(welcomeOpacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
    Animated.timing(welcomeSlide, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      // Animate "to Blue Zone" only after "Welcome" finishes
      Animated.timing(toBlueOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
      Animated.timing(toBlueSlide, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        // Animate button last
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: welcomeOpacity,
                transform: [{ translateY: welcomeSlide }],
              },
            ]}
          >
            Welcome
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: toBlueOpacity,
                transform: [{ translateY: toBlueSlide }],
              },
            ]}
          >
            to Blue Zone
          </Animated.Text>
        </View>

        <Animated.View style={{ opacity: buttonOpacity, marginTop: 40, width: "100%" }}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate("LoginEmail")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  textContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  getStartedButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    marginBottom: 18,
    width: "100%",
    alignItems: "center",
  },
  getStartedText: {
    color: "#2575fc",
    fontSize: 20,
    fontWeight: "700",
  },
});
