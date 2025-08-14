import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { submitSetup } from "../api/user"; // API call to /api/user/setup
import { AuthContext } from "../navigation/AuthContext";

export default function MedsScreen({ navigation, route, meds, setMeds, selectedGoals }) {
  const [input, setInput] = useState("");
  const { setSetupComplete } = useContext(AuthContext);

  const addMed = () => {
    if (input.trim()) {
      setMeds([...meds, input.trim()]);
      setInput("");
    }
  };

  const removeMed = (med) => setMeds(meds.filter(m => m !== med));

  const handleSubmit = async () => {
    try {
      await submitSetup({ goals: selectedGoals, meds });
      setSetupComplete(true); // Update setup complete status
    } catch (err) {
      console.log("Submit setup failed:", err);
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Current Meds</Text>
      <View style={{ flexDirection:"row", marginBottom:10 }}>
        <TextInput
          style={{ flex:1, borderWidth:1, borderColor:"#ccc", padding:10 }}
          placeholder="Medication name"
          value={input}
          onChangeText={setInput}
        />
        <Button title="+" onPress={addMed} />
      </View>
      <FlatList
        data={meds}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection:"row", justifyContent:"space-between", marginBottom:5 }}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => removeMed(item)}><Text style={{color:"red"}}>X</Text></TouchableOpacity>
          </View>
        )}
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20,justifyContent:"center"},
  title:{fontSize:24,marginBottom:20}
});
