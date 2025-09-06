import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={["#f9fafc", "#e6ebf2"]}
      style={styles.container}
    >

      <View style={styles.card}>
        <Text style={styles.title}>Welcome to BlueZone</Text>
        <Text style={styles.subtitle}>
          Click "Scanner" on the bottom bar to get started!
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2575fc",
    marginTop: 40,
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6, // for Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2575fc",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
