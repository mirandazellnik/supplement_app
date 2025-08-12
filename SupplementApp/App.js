import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function App() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.207:5000/api/supplements/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
        alert("No recommendations found.");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Render one item in the recommendations list
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.info_url) Linking.openURL(item.info_url);
      }}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemRating}>⭐ {item.rating.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your goals or questions"
        value={query}
        onChangeText={setQuery}
        editable={!loading}
      />

      <Button title={loading ? "Loading..." : "Get Recommendations"} onPress={sendQuery} disabled={loading} />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <FlatList
        style={{ marginTop: 20, width: "100%" }}
        data={recommendations}
        keyExtractor={(item, index) => item.name + index}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? <Text style={{ textAlign: "center", marginTop: 20 }}>No recommendations yet.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  itemContainer: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemRating: {
    fontSize: 14,
    color: "#666",
  },
});