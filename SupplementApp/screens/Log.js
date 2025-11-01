import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Button } from 'react-native';
import { readLogs, clearLogs } from '../util/logger';

export default function LogViewer() {
  const [logs, setLogs] = useState('');

  const refresh = async () => {
    const content = await readLogs();
    setLogs(content);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Button title="Refresh Logs" onPress={refresh} />
      <Button title="Clear Logs" onPress={clearLogs} />
      <Text style={{ fontFamily: 'monospace' }}>{logs}</Text>
    </ScrollView>
  );
}