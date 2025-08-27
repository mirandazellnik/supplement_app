// App.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { io } from "socket.io-client";

export default function App() {
  const [status, setStatus] = useState("🔴 Disconnected");
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    // Point this to your backend server IP
    const socket = io("http://192.168.3.40:5000", {
      transports: ["websocket"], // force websocket, skip polling
    });

    socket.on("connect", () => {
      console.log("✅ Connected!", socket.id);
      setStatus("🟢 Connected");
      setSocketId(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
      setStatus("🔴 Disconnected");
      setSocketId(null);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Socket.IO Test</Text>
      <Text style={styles.status}>{status}</Text>
      {socketId && <Text style={styles.id}>ID: {socketId}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  status: {
    fontSize: 20,
    color: "lightgreen",
    marginBottom: 10,
  },
  id: {
    fontSize: 16,
    color: "skyblue",
  },
});
