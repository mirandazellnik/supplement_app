import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen({ navigation }) {
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeSlide = useRef(new Animated.Value(30)).current;

  const toGreenOpacity = useRef(new Animated.Value(0)).current;
  const toGreenSlide = useRef(new Animated.Value(30)).current;

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
      // Animate "to Green Zone" only after "Welcome" finishes
      Animated.timing(toGreenOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();
      Animated.timing(toGreenSlide, {
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
                opacity: toGreenOpacity,
                transform: [{ translateY: toGreenSlide }],
              },
            ]}
          >
            to Green Zone
          </Animated.Text>
        </View>

        <Animated.View style={{ opacity: buttonOpacity, marginTop: 40 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("WelcomePage2")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
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
    // Fix height to avoid jumps
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
  button: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  buttonText: {
    color: "#2575fc",
    fontSize: 18,
    fontWeight: "700",
  },
});
