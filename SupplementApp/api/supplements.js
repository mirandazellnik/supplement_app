import axios from "axios";
import io from "socket.io-client";
import { getToken } from "../util/storage";


const BASE_URL = require("./api_url.json").api_url;
const API_URL = BASE_URL + "/api/supplements";

let socket; // global socket reference

// --- LOOKUP FUNCTION ---
export async function lookup(upc) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/lookup`,
      { barcode: upc },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return res.data; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}

// --- CONNECT TO SOCKET ---
export function connectSocket(token, onUpdate, onError, onSimilar, onSimilarError) {
  console.log("Connecting to socket with token:", token);
  if (!socket) {
    socket = io(BASE_URL, {
      auth: { token },  // send JWT if backend checks auth
      transports: ["websocket"], // force websocket (skip polling)
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    // Background task results will arrive here
    socket.on("lookup_update", (data) => {
      console.log("📦 Received update:", data);
      onUpdate(data); // pass update to frontend UI
    });

    socket.on("lookup_update_error", (err) => {
      console.error("⚠️ Lookup update error:", err);
      onError(err);
    });

    socket.on("recommend_similar_products", (data) => {
      console.log("📦 Received similar products:", data);
      onSimilar(data); // pass similar products to frontend UI
    });

    socket.on("recommend_similar_products_error", (err) => {
      console.error("⚠️ Similar products error:", err);
      onSimilarError(err);
    });
  }
}


// --- DISCONNECT SOCKET ---
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}