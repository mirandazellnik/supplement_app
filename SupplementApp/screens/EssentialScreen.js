import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import StarRating from "../components/StarRating";

import { getEssential } from "../api/essentials";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

import { joinEssentialRoom } from "../api/socket/essentialSocket";
import { leaveRoom } from "../api/socket/socket";
import ProductImageById from "../components/ProductImageById";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAlert } from "../contexts/AlertContext";

const PRODUCT_IMAGE_SIZE = 60;

const EssentialScreen = ({ navigation, essentialName }) => {
    //const { essentialName } = route.params || {};

  //const [essentialName, setEssentialName] = useState("Vitamin C");
  const [essentialDesc, setEssentialDesc] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(true);
  const [essentialNameToLookup, setEssentialNameToLookup] = useState(essentialName);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const bottomTabHeight = useBottomTabBarHeight()
  const { showAlert } = useAlert()

  useEffect(() => {
    
    joinEssentialRoom(essentialName, {
      e_onProducts: (products) => {
        console.log("calllback!")
        setProducts(products["products"]);
        setLoadingProducts(false);
      },
      e_onProductsError: (error) => {
        console.error("Error fetching products:", error);
        setLoadingProducts(false);
      },
      onReady: () => {
        setEssentialNameToLookup(essentialName);
      },
    });

    return () => {
      leaveRoom("e_" + essentialName);
    };
  }, [essentialName]);

  useEffect(() => {
    setEssentialDesc("");
    setLoadingDesc(true);
    setProducts([]);
    setLoadingProducts(true);
  }, [essentialName]);

  useEffect(() => {
    if (!essentialNameToLookup) return;

    async function fetchEssential() {
      let desc;
      try {
        desc = await getEssential(essentialNameToLookup);
      } catch (e) {
        showAlert("Something went wrong", "Sorry, please try again later!")
      }
      setEssentialDesc(desc);
      setLoadingDesc(false);
    }
    fetchEssential();
  }, [essentialNameToLookup]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => {item?.id ? navigation.push("Product", {id: item.id, name: item.name, brand: item.brand, inStack: true}) : 1}} style={styles.productBox}>
      <ProductImageById loading={loadingProducts} productId={item.id} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={3} size={18} gap={2} />
          <Text style={styles.ratingText}>{3}/5</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex:1, paddingBottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.lg}}>
          <Text style={styles.essentialName}>{essentialName}</Text>
          {loadingDesc ? (
                  <View style={{ alignItems: "center", marginVertical: spacing.md }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text>Loading...</Text>
                  </View>
                ) : (
          <Text style={styles.essentialDescription}>{essentialDesc}</Text>)}
          <Text style={styles.sectionTitle}>Products with {essentialName}</Text>
    { loadingProducts ? (
                  <View style={{ alignItems: "center", marginVertical: spacing.md }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text>Loading...</Text>
                  </View>
                ) :
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderProduct}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      contentContainerStyle={{ paddingBottom: bottomTabHeight }}
    />
    }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  essentialName: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 6,
  },
  essentialDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: "bold",
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
    marginBottom: 4,
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
});

export default EssentialScreen;
