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
import { BottomSheetScrollView, BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { lookup } from "../api/supplements";
import { joinProductRoom } from "../api/socket/supplementSocket";
import { leaveRoom as leaveProductRoom } from "../api/socket/socket";
import {
  FlatList
} from 'react-native-gesture-handler';
import { AuthContext } from "../contexts/AuthContext";
import ProductImageById from "../components/ProductImageById";
import { useAlert } from "../contexts/AlertContext";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";

const ESSENTIALS_PLACEHOLDER = [
  { id: "1", name: "Vitamin C" },
  { id: "2", name: "Zinc" },
  { id: "3", name: "Magnesium" },
  { id: "4", name: "Vitamin D" },
  { id: "5", name: "Iron" },
];

const CATEGORIES_PLACEHOLDER = [
  { id: "1", name: "Purity", score:1, rating: "Good", detail: "Third-party tested for purity and quality." },
  { id: "2", name: "Potency", score:1,rating: "Okay", detail: "Label-accurate and high bio-availability." },
  { id: "3", name: "Additives", score:1,rating: "Great", detail: "Few or no additives or fillers." },
  { id: "4", name: "Safety", score:1,rating: "Okay", detail: "No known risks." },
  { id: "5", name: "Evidence", score:1,rating: "Bad", detail: "Third-party tested for purity and quality." },
  { id: "6", name: "Brand", score:1, rating: "Okay", detail: "Recalls/history of fraud." },
  { id: "7", name: "Environmental", score:1, rating: "Bad", detail: "Manufacturer has strong commitment to ethical." },
];


const ProductScreen = ({ upc, sheetRef, navigation, openDeeperProduct, sharedSheetIndex}) => {

  const [expanded, setExpanded] = useState({});
  const anims = useRef({}).current;
  const scanningRef = useRef(false);
  const { userToken } = React.useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES_PLACEHOLDER);
  const [essentials, setEssentials] = useState(ESSENTIALS_PLACEHOLDER);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingEssentials, setLoadingEssentials] = useState(true);

  const [similarProducts, setSimilarProducts] = useState([]);
  
  const [notFound, setNotFound] = useState(false);
  const [recFailed, setRecFailed] = useState(false);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [essentialsFailed, setEssentialsFailed] = useState(false);

  const [upcLookup, setUpcLookup] = useState(null);

  const [beenUp, setBeenUp] = useState(false);

  const { showAlert } = useAlert();

  const [positionOfModal, setPositionOfModal] = useState(sharedSheetIndex.value);

  useAnimatedReaction(
    () => sharedSheetIndex.value,
    (current) => {
      runOnJS(setPositionOfModal)(current); // updates React state
      if (current > 0) {
        runOnJS(setBeenUp)(true);
      }
    }
  );

  useEffect(() => {
    console.log('React state index changed:', positionOfModal);
  }, [positionOfModal]);

  useEffect(() => {
    if (!upc) return;
    // connect socket on mount
    joinProductRoom(upc, {
      onUpdate: (data) => {
        if (data?.categories?.length) {
          setCategories(data.categories);
        }
        if (data?.rating) {
          setProduct((prev) => prev ? { ...prev, rating: data.rating } : prev);
        }

        setLoadingCategories(false);
      },
      onError: (error) => {
        console.log("Socket error:", error);
        setLoadingCategories(false);
        setCategoriesFailed(true);
      },
      onSimilar: (data) => {
        if (data?.recommendations) {
          setSimilarProducts(data.recommendations);
        }
        setLoadingRecs(false);
      },
      onSimilarError: (similarError) => {
        console.log("Similar products error:", similarError);
        setLoadingRecs(false);
        setRecFailed(true);
      },
      onEssentials: (data) => {
        if (data) {
          setEssentials(data);
        }
        setLoadingEssentials(false);
      },
      onEssentialsError: (essentialError) => {
        console.log("Essentials error:", essentialError);
        setLoadingEssentials(false);
        setEssentialsFailed(true);
      },
      onReady: () => {
        setUpcLookup(upc);
        console.log("Socket connected, upcLookup set to", upc);
      },
    });

    return () => {
      leaveProductRoom(upc);
    };
    }, [upc]
  );

  // Reset state when UPC changes
  useEffect(() => {
    if (!upc) return;
    setProduct(null);
    setCategories([]);
    setSimilarProducts([]);
    setEssentials([]);

    setLoadingProduct(true);
    setLoadingCategories(true);
    setLoadingRecs(true);
    setLoadingEssentials(true);

    setNotFound(false);
    setCategoriesFailed(false);
    setEssentialsFailed(false);
    setRecFailed(false);

    setBeenUp(false);

    //setUpcLookup(null);
  }, [upc]);

  // Fetch initial product info via REST
  useEffect(() => {
    if (!upcLookup) return;
    if (!upc || scanningRef.current) return;
    scanningRef.current = true;

    async function fetchProductDetails() {
      try {
        console.log("Fetching product details for UPC:", upc);
        const result = await lookup(upc);

        setProduct({
          name: result?.name || "Unknown Product",
          brand: result?.brand || "Try scanning again!",
          image: result?.image || require("../assets/images/vitamin-c.png"),
          rating: result?.rating || 0,
          id: result?.id || null,
        });

        console.log("Initial product data:", result);
      } catch (e) {
        console.warn("Failed to fetch product:", e);
        setProduct({
          name: "Unknown Product",
          brand: "Try scanning again!",
          image: require("../assets/images/vitamin-c.png"),
          rating: 0,
        });
        setNotFound(true);
      } finally {
        setLoadingProduct(false);
        setTimeout(() => (scanningRef.current = false), 600);
      }
    }

    fetchProductDetails();
  }, [upcLookup]);

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
    <BottomSheetScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop:0 }} nestedScrollEnabled>
      {positionOfModal == 0 && !beenUp ? <Text style={[styles.essentialText, {alignSelf:"center", color:"#777777" }]}>Swipe up to see more</Text> : null}
      {/* Top section */}
      <View style={[styles.topRow, {paddingTop: spacing.lg}]}>
        <ProductImageById loading={loadingProduct && !notFound} productId={product.id} style={styles.productImage} />
        <View style={styles.titleStarsContainer}>
          <Text style={styles.productName} numberOfLines={2} adjustsFontSizeToFit>{product.name}</Text>
          <Text style={styles.brandName} numberOfLines={1} adjustsFontSizeToFit>{product.brand}</Text>
          <View style={styles.starsAndButtonRow}>
            <View style={styles.ratingRow}>
              <StarRating rating={product.rating} size={20} gap={2} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1) == 0 ? "??" : product.rating.toFixed(1)}/5</Text>
            </View>
            <TouchableOpacity onPress={() => {showAlert("Cannot buy", "Sorry, one-click direct buying is not yet available!", true)}} style={styles.purchaseIconButton}>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
              <Text style={styles.buyText}>BUY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Essentials */}
        {notFound ? null : <Text style={styles.sectionTitle}>Essential Ingredients</Text>}
        {loadingEssentials ? notFound ? null : essentialsFailed ? <Text>Unable to fetch detailed information.</Text> :
        <View style={{ alignItems: "center", marginVertical: spacing.md }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text>Fetching more detailed information...</Text>
        </View>
        :
        (<FlatList
        data={essentials}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.essentialItem} onPress={() => { navigation.navigate("JustEssentialScreen", { essentialName: item.name }) }}>
            <Text style={styles.essentialText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />)
      }

      {/* Categories */}
      {notFound ? null : <Text style={styles.sectionTitle}>Categories</Text>}
      {loadingCategories ?
        notFound ?
          null : categoriesFailed ?
            <Text>Unable to fetch detailed information.</Text> :
            (
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
      {notFound ? null : <Text style={styles.sectionTitle}>Similar Products</Text>}
      {recFailed && <Text>Unable to load similar products at this time.</Text>}
      {notFound ? null : loadingRecs ? (
        <View style={{ alignItems: "center", marginVertical: spacing.md }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text>Fetching recommended products...</Text>
        </View>
      ) :
      (similarProducts.length > 0 && (
        <>
          <FlatList
            data={similarProducts}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.similarItem} onPress={() => {openDeeperProduct("ProductScanner", {id: item.id, name: item.name, brand: item.brand, inStack: true, fromHome: true})}}>
                <ProductImageById loading={loadingProduct && !notFound} productId={item.id} style={styles.similarImage} />
                <Text style={styles.similarName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.similarManufacturer} numberOfLines={1}>
                  {item.brand}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      ))}

    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: spacing.md, backgroundColor: colors.surface },
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
  brandName: {
    fontSize: 18, // smaller than product
    fontWeight: "500",
    color: "#555",
  },

  // Similar products styles
  similarItem: { backgroundColor: colors.background, borderRadius: 16, width: 150, padding: spacing.sm, marginRight: spacing.md, alignItems: "center", elevation: 2 },
  similarImage: { width: 100, height: 100, borderRadius: 8, marginBottom: spacing.sm, backgroundColor: colors.surface },
  similarName: { color: colors.textPrimary, fontWeight: "600", fontSize: 14, textAlign: "center" },
  similarManufacturer: { color: colors.textSecondary, fontSize: 12, marginTop: 2, textAlign: "center" },
  
});

export default ProductScreen;
