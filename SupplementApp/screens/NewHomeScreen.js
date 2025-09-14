import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { connectSocket } from "../api/supplements";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen( {navigation} ) {
  useFocusEffect(
      React.useCallback(() => {
        // Hide the bottom tab bar
        navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: { display: undefined } });
      }, [navigation])
    );

  return (
    <LinearGradient colors={["#f9fafc", "#e6ebf2"]} style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f9fafc" />
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to BlueZone</Text>
        <Text style={styles.subtitle}>
          Click "Scan" to get started!
        </Text>
      </View>

      {/* Floating Scan Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => {navigation.navigate("Barcode Scanner")}}>
        <Ionicons name="barcode-outline" size={24} color="#fff" />
        <Text style={styles.floatingButtonText}>Scan</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "top",
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
    elevation: 6,
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
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2575fc",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 15,
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
