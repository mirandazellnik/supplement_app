import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { removeToken } from "../util/storage";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { logout } = React.useContext(AuthContext);

  const handleLogout = async () => {
    await removeToken();
    //setUserToken(null); // Clear user token in parent component
    logout(); // Call logout function from AuthContext
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});
