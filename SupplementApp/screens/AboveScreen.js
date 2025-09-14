// AboveScreen.js
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";

const AboveScreen = ({ navigation }) => {
  return (
    // DO NOT use GestureHandlerRootView here — the root App already has it.
    <View style={styles.container}>
      {/* Wrapping the content in NativeViewGestureHandler with disallowInterruption
          tells gesture-handler system to prioritize this view's touches. */}
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>AboveScreen</Text>

          {Array.from({ length: 10 }).map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.button}
              onPress={() => alert(`Hello from AboveScreen! (button ${idx + 1})`)}
            >
              <Text style={styles.buttonText}>Press Me {idx + 1}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  scrollView: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    color: "white",
    marginBottom: 16,
  },
  button: {
    height: 100,
    width: 200,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    borderRadius: 8,
  },
  closeButton: {
    height: 60,
    width: 150,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: { color: "white" },
});

export default AboveScreen;
