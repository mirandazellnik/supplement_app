import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BOX_HEIGHT = 180;
const screenHeight = Dimensions.get("window").height;

export default function CustomAlert({ visible, title, message, onClose, light=false }) {
  const slideAnim = useRef(new Animated.Value(50)).current; // slightly below center
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowModal(true);

      slideAnim.setValue(50);
      opacityAnim.setValue(0);
      overlayOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal transparent animationType="none" visible={true}>
      <View style={styles.fullScreen}>
        {/* Dimmed gradient overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Centered alert box */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
              backgroundColor: light ? "#fff" : "#2a2a2a",
            },
          ]}
        >
          <Text style={[styles.title, { color: light ? "#000" : "#fff" }]}>{title}</Text>
          <Text style={[styles.message, { color: light ? "#333" : "#ddd" }]}>{message}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: light ? "#85baff" : "#6a11cb" }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: light ? "#000" : "#fff" }]}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#fff",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#ccc",
  },
  button: {
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
