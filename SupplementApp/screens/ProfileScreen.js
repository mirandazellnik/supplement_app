import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { removeToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { logout } = React.useContext(AuthContext);

  const handleLogout = async () => {
    await removeToken();
    logout();
  };

  return (
    <LinearGradient
      colors={["#f5f7fa", "#c3cfe2"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        {/*<TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Product", { upc:829835006489 })}>
          <Text style={styles.buttonText}>Go to product</Text>

        </TouchableOpacity>*/}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2575fc",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
