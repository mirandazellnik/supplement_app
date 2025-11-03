import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, TabBar } from "react-native-tab-view";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import ProductImageById from "../components/ProductImageById";
import RatingBar from "../components/RatingBar";
import { useAlert } from "../contexts/AlertContext";
import { joinEssentialRoom } from "../api/socket/essentialSocket";
import { leaveRoom } from "../api/socket/socket";
import { getEssential } from "../api/essentials";

const PRODUCT_IMAGE_SIZE = 60;

const EssentialScreen = ({ navigation, essentialName, inHome, inHomeFromModal, essentialHumanName }) => {
  const [essentialDesc, setEssentialDesc] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(true);

  // ✅ separate product states
  const [productsRecommended, setProductsRecommended] = useState([]);
  const [productsAll, setProductsAll] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { showAlert } = useAlert();
  const bottomTabHeight = useBottomTabBarHeight();
  const layout = useWindowDimensions();

  // --- Load products ---
  useEffect(() => {
    joinEssentialRoom(essentialName, {
      e_onProducts: (products) => {
        // for now, assign both lists the same data
        const list = products["products"] || [];
        const list2 = products["products_focused"] || [];
        setProductsRecommended(list2);
        setProductsAll(list);
        setLoadingProducts(false);
      },
      e_onProductsError: (error) => {
        console.error("Error fetching products:", error);
        setLoadingProducts(false);
      },
    });

    return () => {
      leaveRoom("e_" + essentialName);
    };
  }, [essentialName]);

  // --- Load essential description ---
  useEffect(() => {
    async function fetchEssential() {
      try {
        const desc = await getEssential(essentialName);
        setEssentialDesc(desc);
      } catch (e) {
        showAlert("Something went wrong", "Sorry, please try again later!");
      } finally {
        setLoadingDesc(false);
      }
    }
    fetchEssential();
  }, [essentialName]);

  // --- Product card renderer ---
  // --- Product card renderer ---
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (!item?.id) return;
        if (inHomeFromModal) {
          navigation.navigate("BeyondScanner", {
            screen: "ProductScanner",
            params: { id: item.id, name: item.name, brand: item.brand, inStack: true, fromHome: true },
          });
        } else {
          navigation.push(inHome ? "ProductScanner" : "Product", {
            id: item.id,
            name: item.name,
            brand: item.brand,
            inStack: true,
          });
        }
      }}
      style={styles.productBox}
    >
      <ProductImageById
        loading={loadingProducts}
        productId={item.id}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        {item.brand ? (
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        ) : null}

        <View style={styles.ratingRow}>
          <RatingBar rating={Math.round(item?.score * 10) / 20} />
          <Text style={styles.ratingText}>
            {Math.round(item?.score * 10)}/100
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- Reusable scene renderer (uses the appropriate list) ---
  const renderProductList = useCallback(
    (data) => (
      <View style={{ flex: 1 }}>
        {loadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderProduct}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              
            }}
          />
        )}
      </View>
    ),
    [loadingProducts, bottomTabHeight]
  );

  // --- TabView setup ---
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "recommended", title: "Main Ingredient" },
    { key: "all", title: "Blended Formula" },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "recommended":
        return renderProductList(productsRecommended);
      case "all":
        return renderProductList(productsAll);
      default:
        return null;
    }
  };

  const ExpandableDescription = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    const MAX_LENGTH = 200;

    if (!text) return null;

    const isTruncated = text.length > MAX_LENGTH;
    const displayText = expanded ? text : text.slice(0, MAX_LENGTH) + (isTruncated ? "..." : "");

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => isTruncated && setExpanded(!expanded)}
        style={styles.descBox}
      >
        <Text style={styles.essentialDescriptionBoxText}>{displayText}</Text>

        {isTruncated && (
          <View style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>
              {expanded ? "Show less" : "Read more"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1, paddingTop: spacing.lg }}>
      <Text style={styles.essentialName}>{essentialHumanName}</Text>

      {loadingDesc ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text>Loading...</Text>
        </View>
      ) : (
        <ExpandableDescription text={essentialDesc} />
      )}

      <Text style={styles.sectionTitle}>Top Products with {essentialHumanName}</Text>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.primary }}
            style={{ backgroundColor: "#f1f1f1" }}
            labelStyle={{ fontWeight: "600" }}
            activeColor={colors.primary}
            inactiveColor="#666"
          />
        )}
        lazy={false}
        renderLazyPlaceholder={() => null}
        swipeEnabled={false}
        animationEnabled={true}
        removeClippedSubviews={false}
        gestureHandlerProps={{
          activeOffsetX: [-20, 20],
          failOffsetY: [-5, 5],
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  essentialName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 6,
    paddingHorizontal: spacing.lg,
  },
  essentialDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: "bold",
    paddingHorizontal: spacing.lg,
  },
  productBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productImage: {
    width: PRODUCT_IMAGE_SIZE,
    height: PRODUCT_IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  productName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 17,
    marginBottom: 0,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  descContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
    fontSize: 15,
  },
  descBox: {
  backgroundColor: "#f8f9fb",
  borderRadius: 14,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md, // single consistent padding
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
  shadowColor: "#000",
  shadowOpacity: 0.03,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
},

// updated text style inside description box
essentialDescriptionBoxText: {
  ...typography.body,
  color: "#777",
  fontSize: 15,
  lineHeight: 20,
},

readMoreButton: {
  alignSelf: "flex-start",
  backgroundColor: colors.primary + "15",
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: 4,
  marginTop: 8,
},

readMoreText: {
  color: colors.primary,
  fontWeight: "600",
  fontSize: 14,
},
productBrand: {
  color: "#222",
  fontSize: 14,
  marginBottom: 8,
  opacity: 0.8,
},
});

export default EssentialScreen;
