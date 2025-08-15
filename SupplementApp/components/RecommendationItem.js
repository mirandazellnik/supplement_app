import React from "react";
import { TouchableOpacity, Text, StyleSheet, Linking, View } from "react-native";

export default function RecommendationItem({ item }) {
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.info_url) Linking.openURL(item.info_url);
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRating}>⭐ {item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemRating: {
    fontSize: 14,
    color: "#666",
  },
});
