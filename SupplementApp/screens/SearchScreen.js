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
import { search } from "../api/supplements"
import { useAlert } from "../contexts/AlertContext";

export default function SearchScreen( {navigation} ) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const doSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await search(query); // calls DSLD via your backend
      console.log(data)
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else {
        setResults([]);
        showAlert("No products found.");
      }
    } catch (error) {
      console.error(error);
      showAlert("Error searching products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f9fafc", "#e6ebf2"]} style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter product name, brand, or ingredient"
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        editable={!loading}
        onSubmitEditing={doSearch}
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={doSearch}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Searching..." : "Search"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item, index) =>
          (item.dsldId ? String(item.dsldId) : index.toString())
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultCard} onPress={() => {navigation.navigate("Product", {navigation, id: item._id, name: item._source.fullName, brand: item._source.brandName})}}>
            <Text style={styles.resultName}>{item._source.fullName}</Text>
            <Text style={styles.resultBrand}>{item._source.brandName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No results yet.</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
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
  list: { width: "100%", marginTop: 15 },
  resultCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  resultName: { fontSize: 16, fontWeight: "600", color: "#222" },
  resultBrand: { fontSize: 14, color: "#555", marginTop: 4 },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
});
