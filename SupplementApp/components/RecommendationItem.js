import React from "react";
import { TouchableOpacity, Text, StyleSheet, Linking } from "react-native";

export default function RecommendationItem({ item }) {
  return (
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
}

const styles = StyleSheet.create({
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