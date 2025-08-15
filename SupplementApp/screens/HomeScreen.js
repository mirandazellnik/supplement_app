import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getRecommendations } from "../services/api";
import RecommendationItem from "../components/RecommendationItem";
import { useAlert } from "../contexts/AlertContext";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const sendQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await getRecommendations(query);
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
        showAlert("No recommendations found.");
      }
    } catch (error) {
      showAlert("Error fetching recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#f9fafc", "#e6ebf2"]}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your goals or questions"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={sendQuery}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Get Recommendations"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <FlatList
        style={styles.list}
        data={recommendations}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => <RecommendationItem item={item} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No recommendations yet.</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  inputContainer: { marginBottom: 20 },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#2575fc",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  list: { width: "100%" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 20, fontSize: 16 },
});
