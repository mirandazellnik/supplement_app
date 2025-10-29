import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useAlert } from "../contexts/AlertContext";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";
import { searchEssentialName } from "../api/essentials";

const TOP_LIST_NEW = [
  { id: "1", name: "magnesium", human_name: "Magnesium" },
  { id: "2", name: "vitamin b12", human_name: "Vitamin B12" },
  { id: "3", name: "vitamin b6", human_name: "Vitamin B6" },
  { id: "4", name: "vitamin c", human_name: "Vitamin C" },
  { id: "5", name: "calcium", human_name: "Calcium" },
  { id: "6", name: "zinc", human_name: "Zinc" },
  { id: "7", name: "thiamine", human_name: "Thiamine" },
  { id: "8", name: "vitamin e", human_name: "Vitamin E" },
  { id: "9", name: "vitamin d", human_name: "Vitamin D" },
  { id: "10", name: "folate", human_name: "Folate" },
  { id: "11", name: "vitamin a", human_name: "Vitamin A" },
];

export default function TopProductsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { showAlert } = useAlert();

  const handleNavigate = (essentialName, humanName) => {
    navigation.navigate("Essential", {
      essentialName,
      essentialHumanName: humanName || essentialName,
      navigation: navigation,
    });
    setModalVisible(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const qResp = await searchEssentialName(searchTerm.trim());
      const results = qResp.results;
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
        showAlert("No matching ingredient found.");
      }
    } catch (error) {
      console.error("Ingredient search error:", error);
      showAlert("Error searching ingredient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f9fafc", "#e6ebf2"]} style={[styles.container, {overflow: "visible"}]}>
      <StatusBar style="dark" backgroundColor="#f9fafc" />
      <FlatList
        data={TOP_LIST_NEW}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <View style={{marginTop: 25, marginHorizontal: 5}}>
          <View style={[styles.card]}>
            <Text style={styles.bigTitle} numberOfLines={1} adjustsFontSizeToFit>
              Top Products by Ingredient
            </Text>
            <Text style={styles.subtitle}>
              Find the best rated products!
            </Text>
          </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.essentialButton}
            onPress={() => handleNavigate(item.name, item.human_name)}
          >
            <Text style={styles.essentialText}>{item.human_name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.essentialButton, styles.otherButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.essentialText, { color: "#fff" }]}>
              Other Ingredient
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Modal for custom ingredient search */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Search Ingredient</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                  style={styles.closeButtonWrapper}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Enter ingredient name"
                value={searchTerm}
                onChangeText={setSearchTerm}
                editable={!loading}
                onSubmitEditing={handleSearch}
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSearch}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Search</Text>
              </TouchableOpacity>

              {loading && <ActivityIndicator size="small" color={colors.primary} />}

              {searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => item.id || index.toString()}
                  style={{ marginTop: 20, width: "100%" }}
                  contentContainerStyle={{ paddingVertical: 5 }}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.essentialButton, { marginBottom: 8 }]}
                      onPress={() => handleNavigate(item.name, item.human_name)}
                    >
                      <Text style={styles.essentialText}>
                        {item.human_name || item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 0,
    paddingTop: 0
  },
  // 🧊 Added card style to match HomeScreen
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 25,
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2575fc",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  essentialButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: spacing.sm,
    alignItems: "center",
    elevation: 1,
  },
  essentialText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  otherButton: {
    backgroundColor: colors.primary || "#2575fc",
    marginTop: spacing.md,
  },
  modalInput: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  modalButton: {
    backgroundColor: colors.primary || "#2575fc",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  closeButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
});
