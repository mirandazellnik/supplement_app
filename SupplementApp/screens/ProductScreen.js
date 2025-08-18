import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { Ionicons } from "@expo/vector-icons";

const essentials = [
  { id: "1", name: "Vitamin C" },
  { id: "2", name: "Zinc" },
  { id: "3", name: "Magnesium" },
  { id: "4", name: "Vitamin D" },
  { id: "5", name: "Iron" },
];

const categories = [
  { id: "1", name: "Effectiveness", rating: "High", detail: "Clinically proven to be effective in most users." },
  { id: "2", name: "Safety", rating: "Medium", detail: "Generally safe, but consult your doctor if unsure." },
  { id: "3", name: "Absorption", rating: "High", detail: "Absorbs well with or without food." },
  { id: "4", name: "Value", rating: "Medium", detail: "Priced competitively for its category." },
  { id: "5", name: "Purity", rating: "High", detail: "Third-party tested for purity and quality." },
  { id: "6", name: "Taste", rating: "Low", detail: "Some users report a strong aftertaste." },
  { id: "7", name: "Packaging", rating: "High", detail: "Eco-friendly and easy to use." },
];

const ProductScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState({});

  const product = {
    name: "Super Immune Boost",
    image: require("../assets/images/vitamin-c.png"), // Replace with your image
    rating: 4.4,
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? "star" : rating >= i - 0.5 ? "star-half" : "star-outline"}
          size={22}
          color={colors.primary}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Top section: Product image and name */}
      <View style={styles.topRow}>
        <Image source={product.image} style={styles.productImage} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.productName}>{product.name}</Text>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>
        {renderStars(product.rating)}
        <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
      </View>

      {/* Essentials */}
      <Text style={styles.sectionTitle}>Essentials</Text>
      <View style={styles.essentialsContainer}>
        <FlatList
          data={essentials}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.essentialItem} onPress={() => {/* navigation to chemical page */}}>
              <Text style={styles.essentialText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      {categories.map((cat) => (
        <View key={cat.id} style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleExpand(cat.id)}>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <View style={styles.categoryRatingRow}>
              <Text style={styles.categoryRating}>{cat.rating}</Text>
              <Ionicons
                name={expanded[cat.id] ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {expanded[cat.id] && (
            <View style={styles.categoryDetail}>
              <Text style={styles.categoryDetailText}>{cat.detail}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Purchase Button */}
      <TouchableOpacity style={styles.purchaseButton} onPress={() => {/* navigation to purchase */}}>
        <Text style={styles.purchaseButtonText}>Purchase</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ESSENTIAL_ITEM_WIDTH = 110;
const ESSENTIAL_ITEM_HEIGHT = 54;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  productName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "bold",
    flexShrink: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  ratingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: "bold",
  },
  essentialsContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  essentialItem: {
    backgroundColor: colors.primary + "15", // light tint of primary
    borderRadius: 16,
    width: ESSENTIAL_ITEM_WIDTH,
    height: ESSENTIAL_ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    marginVertical: spacing.xs,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  essentialText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: "hidden",
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  categoryName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  categoryRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryRating: {
    color: colors.primary,
    fontWeight: "bold",
    marginRight: 6,
    fontSize: 15,
  },
  categoryDetail: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  categoryDetailText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  purchaseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
});
export default ProductScreen;
