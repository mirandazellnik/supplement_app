import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../components/StarRating";
import { BottomSheetScrollView, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { lookup, disconnectSocket, connectSocket } from "../api/supplements";
import { io } from "socket.io-client";
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  FlatList
} from 'react-native-gesture-handler';
import { AuthContext } from "../contexts/AuthContext";

const ESSENTIALS_PLACEHOLDER = [
  { id: "1", name: "Vitamin C" },
  { id: "2", name: "Zinc" },
  { id: "3", name: "Magnesium" },
  { id: "4", name: "Vitamin D" },
  { id: "5", name: "Iron" },
];

const CATEGORIES_PLACEHOLDER = [
  { id: "1", name: "Purity", rating: "Good", detail: "Third-party tested for purity and quality." },
  { id: "2", name: "Potency", rating: "Okay", detail: "Label-accurate and high bio-availability." },
  { id: "3", name: "Additives", rating: "Great", detail: "Few or no additives or fillers." },
  { id: "4", name: "Safety", rating: "Okay", detail: "No known risks." },
  { id: "5", name: "Evidence", rating: "Bad", detail: "Third-party tested for purity and quality." },
  { id: "6", name: "Brand", rating: "Okay", detail: "Recalls/history of fraud." },
  { id: "7", name: "Environmental", rating: "Bad", detail: "Manufacturer has strong commitment to ethical." },
];

const ProductScreen = ({ upc, sheetRef }) => {
  const [expanded, setExpanded] = useState({});
  const anims = useRef({}).current;
  const scanningRef = useRef(false);
  const { userToken } = React.useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES_PLACEHOLDER);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [essentials, setEssentials] = useState(ESSENTIALS_PLACEHOLDER);

  useEffect(() => {
    // connect socket on mount
    connectSocket(userToken,
      (data) => {
        if (data?.categories?.length) {
          setCategories(data.categories);
        }
        if (data?.rating) {
          setProduct((prev) => prev ? { ...prev, rating: data.rating } : prev);
        }

        setLoadingCategories(false);
      },
      (error) => {console.error("Socket error:", error);},
      (data) => {
        if (data?.recommendations) {
          setSimilarProducts(data.recommendations);
        }
      },
      (similarError) => {console.error("Similar products error:", similarError);}
    );
  
    return () => {
      disconnectSocket();
    };
    }, [upc]
  );

  // Reset state when UPC changes
  useEffect(() => {
    if (!upc) return;
    setProduct(null);
    setCategories([]);
    setSimilarProducts([]);
    setLoadingProduct(true);
    setLoadingCategories(true);
  }, [upc]);

  // Fetch initial product info via REST
  useEffect(() => {
    if (!upc || scanningRef.current) return;
    scanningRef.current = true;

    async function fetchProductDetails() {
      try {
        console.log("Fetching product details for UPC:", upc);
        const result = await lookup(upc);

        setProduct({
          name: result?.name || "Unknown Product",
          image: result?.image || require("../assets/images/vitamin-c.png"),
          rating: result?.rating || 0,
        });

        console.log("Initial product data:", result);
      } catch (e) {
        console.warn("Failed to fetch product:", e);
        setProduct({
          name: "Unknown Product",
          image: require("../assets/images/vitamin-c.png"),
          rating: 0,
        });
      } finally {
        setLoadingProduct(false);
        setTimeout(() => (scanningRef.current = false), 600);
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
    if (!rating) return "#B0B0B0";
    switch (rating.toLowerCase()) {
      case "great": return "#1B873B";
      case "good": return "#6DD47E";
      case "okay": return "#FFA500";
      case "bad": return "#FF3B30";
      default: return "#B0B0B0";
    }
  };

  // Still loading product? Show spinner
  if (loadingProduct || !product) {
    return (
      <BottomSheetScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Loading product...</Text>
        </View>
      </BottomSheetScrollView>
    );
  }

  return (
    <BottomSheetScrollView contentContainerStyle={{ padding: spacing.lg }} nestedScrollEnabled>
      {/* Top section */}
      <View style={styles.topRow}>
        <Image source={product.image} style={styles.productImage} />
        <View style={styles.titleStarsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.starsAndButtonRow}>
            <View style={styles.ratingRow}>
              <StarRating rating={product.rating} size={20} gap={2} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
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
        data={ESSENTIALS_PLACEHOLDER}
        horizontal
        nestedScrollEnabled
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
      {loadingCategories ? (
        <View style={{ alignItems: "center", marginVertical: spacing.md }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text>Fetching more detailed information...</Text>
        </View>
      ) : (
        categories.map((cat, idx) => {
          if (!anims[idx]) anims[idx] = new Animated.Value(0);
          return (
            <View key={idx} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleExpand(idx)}
              >
                <Text style={styles.categoryName}>{cat.name}</Text>
                <View style={styles.categoryRatingRow}>
                  <Text style={styles.categoryRating}>{cat.rating}</Text>
                  <View
                    style={[styles.ratingDot, { backgroundColor: getDotColor(cat.rating) }]}
                  />
                </View>
              </TouchableOpacity>
              <Animated.View
                style={{
                  overflow: "hidden",
                  height: anims[idx].interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
                  opacity: anims[idx],
                }}
              >
                <View style={styles.categoryDetail}>
                  <Text style={styles.categoryDetailText}>{cat.detail || ""}</Text>
                </View>
              </Animated.View>
            </View>
          );
        })
      )}
      {/* Similar products */}
      {similarProducts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Similar Products</Text>
          <FlatList
            data={similarProducts}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.upc}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.similarItem}>
                <Image
                  source={require("../assets/images/vitamin-c.png")} 
                  style={styles.similarImage}
                />
                <Text style={styles.similarName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.similarManufacturer} numberOfLines={1}>
                  {item.manufacturer}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

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

  // Similar products styles
  similarItem: { backgroundColor: colors.background, borderRadius: 16, width: 150, padding: spacing.sm, marginRight: spacing.md, alignItems: "center", elevation: 2 },
  similarImage: { width: 100, height: 100, borderRadius: 12, marginBottom: spacing.sm, backgroundColor: colors.surface },
  similarName: { color: colors.textPrimary, fontWeight: "600", fontSize: 14, textAlign: "center" },
  similarManufacturer: { color: colors.textSecondary, fontSize: 12, marginTop: 2, textAlign: "center" },
});

export default ProductScreen;
