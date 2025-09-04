import { lookup, connectSocket, disconnectSocket } from "../api/supplements";
import { View, Text, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function NewScreen() {
  const [product, setProduct] = useState(null);
  const [updates, setUpdates] = useState([]);
  const { userToken } = React.useContext(AuthContext);

  useEffect(() => {
    // connect socket on mount
    connectSocket(userToken, (data) => {
      setUpdates((prev) => [...prev, data]);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleScan = async () => {
    let upc = "863897000085"; // example UPC

    const initial = await lookup(upc, userToken);
    setProduct(initial); // immediate response
  };

  return (
    <View>
      <Button title="Scan Example UPC" onPress={handleScan} />
      {product && <Text>Initial: {JSON.stringify(product)}</Text>}
      {updates.map((u, i) => (
        <Text key={i}>Update: {JSON.stringify(u)}</Text>
      ))}
    </View>
  );
}