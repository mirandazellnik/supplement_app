import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [healthStatus, setHealthStatus] = useState('');

  const checkHealth = async () => {
    try {
      // Change to your Flask server URL
      const res = await fetch('http://192.168.1.207:5000/api/health/health');
      const data = await res.json();
      setHealthStatus(JSON.stringify(data));
    } catch (error) {
      setHealthStatus(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Check Server Health" onPress={checkHealth} />
      {healthStatus ? <Text style={styles.text}>{healthStatus}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});