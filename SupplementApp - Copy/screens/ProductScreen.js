import React, { useState, useRef } from "react";
import { Animated, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../components/StarRating";

const essentials = [
  { id: "1", name: "Vitamin C" },
  { id: "2", name: "Zinc" },
  { id: "3", name: "Magnesium" },
  { id: "4", name: "Vitamin D" },
  { id: "5", name: "Iron" },
];

const categories = [
  { id: "1", name: "Purity", rating: "Good", detail: "Third-party tested for purity and quality." },
  { id: "2", name: "Potency", rating: "Okay", detail: "Label-accurate and high bio-availability." },
  { id: "3", name: "Additives", rating: "Great", detail: "Few or no additives or fillers." },
  { id: "4", name: "Safety", rating: "Okay", detail: "No known risks." },
  { id: "5", name: "Evidence", rating: "Bad", detail: "Third-party tested for purity and quality." },
  { id: "6", name: "Brand", rating: "Okay", detail: "Recalls/history of fraud." },
  { id: "7", name: "Environmental", rating: "Bad", detail: "Manufacturer has strong commitment to ethical." },
];

const ProductScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState({});
  const anims = useRef({}).current;

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Animate open/close
      if (!anims[id]) {
        anims[id] = new Animated.Value(prev[id] ? 1 : 0);
      }
      Animated.timing(anims[id], {
        toValue: next[id] ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
      return next;
    });
  };

  // Add this helper function for dot color:
  const getDotColor = (rating) => {
    switch (rating.toLowerCase()) {
      case "great":
        return "#1B873B"; // dark green
      case "good":
        return "#6DD47E"; // light green
      case "okay":
        return "#FFA500"; // orange
      case "bad":
        return "#FF3B30"; // red
      case "medium":
        return "#FFD966"; // yellowish for "Medium"
      case "high":
        return "#1B87B8"; // blue for "High"
      case "low":
        return "#B81B1B"; // dark red for "Low"
      default:
        return "#B0B0B0"; // neutral gray fallback
    }
  };

  const product = {
    name: "Super Immune Boost",
    image: require("../assets/images/vitamin-c.png"), // Replace with your image
    rating: 4.4,
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? "star" : rating >= i - 0.5 ? "star-half" : "star-outline"}
          size={20}
          color={colors.primary}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Top section: Product image, name, stars, and purchase button */}
      <View style={styles.topRow}>
        <Image source={product.image} style={styles.productImage} />
        <View style={styles.titleStarsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.starsAndButtonRow}>
            <View style={styles.ratingRow}>
              <StarRating rating={product.rating} size={20} gap={2} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
            </View>
            <TouchableOpacity style={styles.purchaseIconButton} onPress={() => {/* navigation to purchase */}}>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
              <Text style={styles.buyText}>BUY</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      {categories.map((cat) => {
        if (!anims[cat.id]) anims[cat.id] = new Animated.Value(0);
        return (
          <View key={cat.id} style={styles.categoryContainer}>
            <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleExpand(cat.id)}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.categoryRatingRow}>
                <Text style={styles.categoryRating}>{cat.rating}</Text>
                <View
                  style={[
                    styles.ratingDot,
                    { backgroundColor: getDotColor(cat.rating) },
                  ]}
                />
                <Ionicons
                  name={expanded[cat.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
            <Animated.View
              style={{
                overflow: "hidden",
                height: anims[cat.id].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
                opacity: anims[cat.id],
              }}
            >
              <View style={styles.categoryDetail}>
                <Text style={styles.categoryDetailText}>{cat.detail}</Text>
              </View>
            </Animated.View>
          </View>
        );
      })}
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
  titleStarsContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  productName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "bold",
    flexShrink: 1,
    marginBottom: 2,
  },
  starsAndButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
 purchaseIconButton: {
    flexDirection: "row", // add this for icon + text
    alignItems: "center",
    marginLeft: 18,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buyText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: 1,
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  essentialItem: {
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  categoryContainer: {
    backgroundColor: colors.background,
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
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    marginLeft: 0,
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
});

export default ProductScreen;
