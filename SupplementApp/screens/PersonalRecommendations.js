// This screen shows personalized supplement recommendations based on user data. For now, just populate with static data.
import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
//import { get_personal_recommendations } from "../api/recommendations";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
//import ProductCard from "../components/ProductCard";
import { useAlert } from "../contexts/AlertContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../contexts/AuthContext";

export default function PersonalRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        //const data = await get_personal_recommendations(userToken);
        
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        showAlert("Error fetching recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: spacing.md,
  },
});