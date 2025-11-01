import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { removeToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfileScreen( { navigation} ) {
  const { logout } = React.useContext(AuthContext);

  const handleLogout = async () => {
    await removeToken();
    logout();
  };

  // List of actions — you can easily add more in the future
  const actions = [
    { id: "logout", label: "Logout", onPress: handleLogout },
    { id: "secret", label: "Secret Test Button", onPress: () => {navigation.navigate("Log")}}
  ];

  return (
    <LinearGradient
      colors={["#f5f7fa", "#c3cfe2"]}
      style={styles.container}
    >
      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.button} onPress={item.onPress}>
            <Text style={styles.buttonText}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#2575fc",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
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
