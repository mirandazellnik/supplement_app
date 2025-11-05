import React, { useState, } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { search } from "../api/supplements"
import { useAlert } from "../contexts/AlertContext";
import { StatusBar } from "expo-status-bar";
import RatingBar from "../components/RatingBar";
import ProductImageById from "../components/ProductImageById";

export default function SearchScreen( {navigation} ) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearchedYet, setHasSearchedYet] = useState(false);
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
      setHasSearchedYet(true);
    } catch (error) {
      //console.error(error);
      showAlert("Error searching products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f9fafc", "#e6ebf2"]} style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f9fafc" />
      <TextInput
        style={styles.input}
        placeholder="Enter product or brand name"
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
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
              navigation.push("Product", {
                id: item._id,
                name: item._source.fullName,
                brand: item._source.brandName,
                inStack: false,
              });
            }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ProductImageById
                loading={false}
                productId={item._id}
                style={styles.similarImage}
              />

              {/* text column */}
              <View style={styles.textColumn}>
                <View>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item._source.fullName}
                  </Text>
                  <Text style={styles.resultBrand} numberOfLines={1}>
                    {item._source.brandName}
                  </Text>
                </View>

                {/* bottom-aligned rating */}
                <View style={styles.ratingRow}>
                  <RatingBar
                    rating={Math.round(item.ratings.overall_score*10) / 20}
                    height={20}
                    width={90}
                  />
                  <Text style={styles.resultBrand}>{Math.round(item.ratings.overall_score*10)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? hasSearchedYet ? (
            <Text style={styles.emptyText}>No results.</Text>
          ) : null : null
        }
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom:0 },
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
  resultName: { fontSize: 16, fontWeight: "600", color: "#222", flexShrink: 1},
  resultBrand: { fontSize: 14, color: "#555", marginTop: 4, flexShrink: 1},
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
  textColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between", // pushes ratingRow to bottom
    flexShrink: 1,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
});
