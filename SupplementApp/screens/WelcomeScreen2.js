import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen2({ navigation }) {
  const firstOpacity = useRef(new Animated.Value(0)).current;
  const firstSlide = useRef(new Animated.Value(30)).current;

  const secondOpacity = useRef(new Animated.Value(0)).current;
  const secondSlide = useRef(new Animated.Value(30)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(firstOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(firstSlide, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(secondOpacity, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(secondSlide, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(buttonOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      });
    });
  }, []);

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      <View style={styles.content}>
        {/* Centered text container */}
        <View style={styles.textWrapper}>
          <Animated.Text
            style={[
              styles.text,
              { opacity: firstOpacity, transform: [{ translateY: firstSlide }] },
            ]}
          >
            We're going to get started by asking you some questions about your wellness goals and preferences. This will help us tailor the experience to your needs.
          </Animated.Text>

          <Animated.Text
            style={[
              styles.text,
              {
                marginTop: 20,
                opacity: secondOpacity,
                transform: [{ translateY: secondSlide }],
              },
            ]}
          >
            Remember that Green Zone is not a substitute for professional medical advice. Always consult with your healthcare provider before making any changes to your health regimen.
          </Animated.Text>
        </View>

        {/* Button appears below text */}
        <Animated.View style={{ opacity: buttonOpacity, marginTop: 40 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("GoalsPage")}
          >
            <Text style={styles.buttonText}>Next</Text>
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
    justifyContent: "center", // vertically center everything
    alignItems: "center",
    paddingHorizontal: 30,
  },
  textWrapper: {
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
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
