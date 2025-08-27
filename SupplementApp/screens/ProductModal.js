import React, { useState, useRef } from "react";
import { Animated, View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../components/StarRating";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { lookup } from "../api/supplements";

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

const ESSENTIAL_ITEM_WIDTH = 110;
const ESSENTIAL_ITEM_HEIGHT = 54;

const ProductScreen = ({upc}) => {
  const [expanded, setExpanded] = useState({});
  const anims = useRef({}).current;
  const scanningRef = useRef(false);


  React.useEffect(() => {
    async function fetchProductDetails() {
      // call API to fetch product details using the upc
      if (scanningRef.current) return; // already scanning
      scanningRef.current = true;
      try {
        if (upc) {
          console.log("Fetching product details for UPC:", upc);
          // Fetch product details here and update state as needed
          const result = await lookup(upc);
          console.log("Lookup result:", result);
          // Update state with product details
        }
      } finally {
        setTimeout(() => scanningRef.current = false, 600); // prevent rapid re-scanning
      }
    }
    fetchProductDetails();
  }, [upc]);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!anims[id]) anims[id] = new Animated.Value(prev[id] ? 1 : 0);
      Animated.timing(anims[id], {
        toValue: next[id] ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
      return next;
    });
  };

  const getDotColor = (rating) => {
    switch (rating.toLowerCase()) {
      case "great": return "#1B873B";
      case "good": return "#6DD47E";
      case "okay": return "#FFA500";
      case "bad": return "#FF3B30";
      default: return "#B0B0B0";
    }
  };

  const product = {
    name: "Super Immune Boost Artovid-20 Tablets",
    image: require("../assets/images/vitamin-c.png"),
    rating: 4.4,
  };

  return (
    <BottomSheetScrollView contentContainerStyle={{ padding: spacing.lg }}>
      {/* Top section */}
      <View style={styles.topRow}>
        <Image source={product.image} style={styles.productImage} />
        <View style={styles.titleStarsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.starsAndButtonRow}>
            <View style={styles.ratingRow}>
              <StarRating rating={product.rating ?? 0} size={20} gap={2} />
              <Text style={styles.ratingText}>{(product.rating ?? 0).toFixed(1)}/5</Text>
            </View>
            <TouchableOpacity style={styles.purchaseIconButton}>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
              <Text style={styles.buyText}>BUY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Essentials */}
      <Text style={styles.sectionTitle}>Essentials</Text>
      <FlatList
        data={essentials}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.essentialItem}>
            <Text style={styles.essentialText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

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
                <View style={[styles.ratingDot, { backgroundColor: getDotColor(cat.rating) }]} />
              </View>
            </TouchableOpacity>
            <Animated.View
              style={{
                overflow: "hidden",
                height: anims[cat.id].interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
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
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  productImage: { width: 70, height: 70, borderRadius: 16, marginRight: spacing.md, backgroundColor: colors.surface },
  titleStarsContainer: { flex: 1, flexDirection: "column", justifyContent: "center" },
  productName: { ...typography.h2, color: colors.textPrimary, fontWeight: "bold", flexShrink: 1, marginBottom: 2 },
  starsAndButtonRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 8, color: colors.textSecondary, fontSize: 16, fontWeight: "500" },
  purchaseIconButton: { flexDirection: "row", alignItems: "center", marginLeft: 18, backgroundColor: "#fff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, elevation: 2 },
  buyText: { color: colors.primary, fontWeight: "bold", fontSize: 16, marginLeft: 6 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: "bold" },
  essentialItem: { backgroundColor: colors.background, borderRadius: 16, width: 110, height: 54, justifyContent: "center", alignItems: "center", marginRight: spacing.md, marginVertical: spacing.xs, elevation: 1 },
  essentialText: { color: colors.textPrimary, fontWeight: "700", fontSize: 16, textAlign: "center" },
  categoryContainer: { backgroundColor: colors.background, borderRadius: 12, marginBottom: spacing.sm, overflow: "hidden", elevation: 1 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md },
  categoryName: { ...typography.body, color: colors.textPrimary, fontWeight: "600", fontSize: 16 },
  categoryRatingRow: { flexDirection: "row", alignItems: "center" },
  categoryRating: { color: colors.primary, fontWeight: "bold", marginRight: 6, fontSize: 15 },
  ratingDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  categoryDetail: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  categoryDetailText: { color: colors.textSecondary, fontSize: 15, lineHeight: 20 },
});

export default ProductScreen;
