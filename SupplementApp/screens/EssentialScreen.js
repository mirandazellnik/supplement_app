import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import StarRating from "../components/StarRating";

import { get_essential } from "../api/essentials";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

// Example data for the essential and its products
const essential = {
  id: "1",
  name: "Vitamin C",
  description:
    "Vitamin C is an essential nutrient involved in the repair of tissue and the enzymatic production of certain neurotransmitters. It is required for the functioning of several enzymes and is important for immune system function.",
};

const products = [
  {
    id: "p1",
    name: "Super Immune Boost",
    image: require("../assets/images/vitamin-c.png"),
    rating: 4.4,
  },
  {
    id: "p2",
    name: "Daily C Complex",
    image: require("../assets/images/vitamin-c.png"),
    rating: 4.0,
  },
  {
    id: "p4",
    name: "C-1000 Plus",
    image: require("../assets/images/vitamin-c.png"),
    rating: 3.7,
  },
  /*  {
    id: "p5",
    name: "C-1000 Plus",
    image: require("../assets/images/vitamin-c.png"),
    rating: 3.7,
  },
    {
    id: "p6",
    name: "C-1000 Plus",
    image: require("../assets/images/vitamin-c.png"),
    rating: 3.7,
  },
    {
    id: "p7",
    name: "C-1000 Plus",
    image: require("../assets/images/vitamin-c.png"),
    rating: 3.7,
  },
    {
    id: "p8",
    name: "C-1000 Plus",
    image: require("../assets/images/vitamin-c.png"),
    rating: 3.7,
  },*/
];

const PRODUCT_IMAGE_SIZE = 60;

const EssentialScreen = ({ navigation, essentialName }) => {
    //const { essentialName } = route.params || {};

  //const [essentialName, setEssentialName] = useState("Vitamin C");
  const [essentialDesc, setEssentialDesc] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(true);

  useEffect(() => {
    async function fetchEssential() {
      const desc = await get_essential(essentialName);
      setEssentialDesc(desc);
      setLoadingDesc(false);
    }
    fetchEssential();
  }, 
  [essentialName])

  useEffect(() => {
    setEssentialDesc("");
    setLoadingDesc(true);

  }, [essentialName])

  const renderProduct = ({ item }) => (
    <View style={styles.productBox}>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={item.rating} size={18} gap={2} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}/5</Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderProduct}
      contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListHeaderComponent={
        <>
          <Text style={styles.essentialName}>{essentialName}</Text>
          {loadingDesc ? (
                  <View style={{ alignItems: "center", marginVertical: spacing.md }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text>Loading...</Text>
                  </View>
                ) : (
          <Text style={styles.essentialDescription}>{essentialDesc}</Text>)}
          <Text style={styles.sectionTitle}>Products with {essentialName}</Text>
        </>
      }
    />
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
    borderRadius: 12,
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
