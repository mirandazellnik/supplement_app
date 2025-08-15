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
  Alert,
} from "react-native";
import { getRecommendations } from "../services/api";
import RecommendationItem from "../components/RecommendationItem";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await getRecommendations(query);
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
        Alert.alert("No recommendations found.");
      }
    } catch (error) {
      Alert.alert("Error fetching recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your goals or questions"
        value={query}
        onChangeText={setQuery}
        editable={!loading}
      />
      <Button
        title={loading ? "Loading..." : "Get Recommendations"}
        onPress={sendQuery}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      <FlatList
        style={{ marginTop: 20, width: "100%" }}
        data={recommendations}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => <RecommendationItem item={item} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No recommendations yet.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
});
