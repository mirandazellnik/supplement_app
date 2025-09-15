import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  View,
  Text,
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
import { lookupbyid, joinProductRoom, leaveProductRoom } from "../api/supplements";
import {
  FlatList,
  ScrollView
} from 'react-native-gesture-handler';
import { AuthContext } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import ProductImageById from "../components/ProductImageById";
import { useAlert } from "../contexts/AlertContext";

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


const ProductScreen = ({ route, navigation }) => {
  const { id, name, brand, inStack, fromHome } = route.params || {};
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

  const { showAlert } = useAlert();

  useFocusEffect(
    React.useCallback(() => {
      // Hide the bottom tab bar
      navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });

      // IMPORTANT: Reset id when navigating away if fromHome is true, essentially unmounting this screen
      return () => {if (fromHome) {navigation.setParams({id: null})}};
    }, [navigation])
  );

  useEffect(() => {
    console.log("OPENED PRODUCT SCREEN, ID:", id)
    if (!id) {
      setUpcLookup(null);
      return;
    }
    // connect socket on mount
    joinProductRoom(id, {
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
            setUpcLookup(id);
            console.log("Socket connected, upcLookup set to", id);
          },
        });
    console.log("Joined product room for ID:", id);

    return () => {
      leaveProductRoom(id);
    };
    }, [id]
  );

  // Reset state when UPC changes
  useEffect(() => {
    if (!id) return;
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

    //setUpcLookup(null);
  }, [id]);

  // Fetch initial product info via REST
  useEffect(() => {
    if (!upcLookup) return;
    if (!id || scanningRef.current) return;
    scanningRef.current = true;

    async function fetchProductDetails() {
      try {
        setProduct((prev) => prev ? { ...prev, id: id } : prev);
        console.log("Fetching product details for ID:", id);
        const result = await lookupbyid(id);

        /*setProduct({
          name: result?.name || "Unknown Product",
          brand: result?.brand || "Unknown Brand",
          image: result?.image || require("../assets/images/vitamin-c.png"),
          rating: result?.rating || 0,
        });*/
        setProduct({
          name: "Unknown Product",
          image: require("../assets/images/vitamin-c.png"),
          rating: 0,
        });
        console.log("Initial product data:", result);
      } catch (e) {
        console.warn("Failed to fetch product:", e);
        setProduct({
          name: "Unknown Product",
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Loading product...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }} nestedScrollEnabled>
      {/* Top section */}
      <View style={styles.topRow}>
        <ProductImageById loading={loadingProduct && !notFound} productId={id} style={styles.productImage} />
        <View style={styles.titleStarsContainer}>
          <Text style={styles.productName} numberOfLines={2} adjustsFontSizeToFit>{name}</Text>
          <Text style={styles.brandName} numberOfLines={1} adjustsFontSizeToFit>{brand}</Text>
          <View style={styles.starsAndButtonRow}>
            <View style={styles.ratingRow}>
              <StarRating rating={product.rating} size={20} gap={2} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
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
          <TouchableOpacity style={styles.essentialItem} onPress={() => { if (fromHome) { navigation.push("EssentialScannerFromProductScanner", { essentialName: item.name }) } else { navigation.navigate("Essential", { essentialName: item.name }) } }}>
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
      {inStack ? null : (
        <View>
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
              <TouchableOpacity style={styles.similarItem} onPress={() => {navigation.push("Product", {id: item.id, name: item.name, brand: item.brand, inStack: true, fromHome: false})}}>
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
      ))}</View>)}

    </ScrollView>
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
