import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 20; // same as SafeAreaView padding
  const spacingBetween = 15;

  // Calculate width of squares so edges match welcome card
  const squareWidth = (width - 2 * horizontalPadding - spacingBetween) / 2;

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.getParent()?.setOptions({
        tabBarStyle: { display: undefined },
      });
    }, [navigation])
  );

  return (
    <LinearGradient colors={["#f9fafc", "#e6ebf2"]} style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f9fafc" />
      <SafeAreaView style={styles.safeArea}>
        {/* Welcome Card */}
        <View style={styles.card}>
          <Text style={styles.bigTitle} numberOfLines={1} adjustsFontSizeToFit>
            Welcome to BlueZone
          </Text>
          <Text style={styles.subtitle}>Click "Scan" to get started!</Text>
        </View>

        {/* Two Squares */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.cardSquare, { width: squareWidth, height: squareWidth, marginRight: spacingBetween }]}
            onPress={() => {}}
          >
            <Text style={styles.title} adjustsFontSizeToFit numberOfLines={2}>Your Plan</Text>
            <Text style={styles.subtitle}>This feature is not yet available!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardSquare, { width: squareWidth, height: squareWidth }]}
            onPress={() => {}}
          >
            <Text style={styles.title}>Update Goals</Text>
            <Text style={styles.subtitle}>This feature is not yet available!</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Scan Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate("Barcode Scanner")}
        >
          <Ionicons name="barcode-outline" size={24} color="#fff" />
          <Text style={styles.floatingButtonText}>Scan</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
  },
  cardSquare: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  bigTitle: { fontSize: 28, fontWeight: "700", color: "#2575fc", textAlign: "center", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", color: "#2575fc", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#000", textAlign: "center", fontWeight: "bold" },
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
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
