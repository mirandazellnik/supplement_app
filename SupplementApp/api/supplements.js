import axios from "axios";
import io from "socket.io-client";
import { getToken } from "../util/storage";


const BASE_URL = require("./api_url.json").api_url;
const API_URL = BASE_URL + "/api/supplements";

let socket; // global socket reference
let constToken; // store token for reconnections

let callbacks = {};

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

export async function search(query) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/search`,
      { q: query },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return res.data.hits; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}

// --- CONNECT TO SOCKET ---
export function connectSocket(token, onConnect) {
  if (!socket) {
    console.log("Creating new socket.");
    constToken = token; // store token for reconnections
    socket = io(BASE_URL, {
      auth: { token },  // send JWT if backend checks auth
      transports: ["websocket"], // force websocket (skip polling)
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
      onConnect();
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    // Background task results will arrive here
    socket.on("lookup_update", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.log("📦 Received update:", data);
        callbacks[room]["onUpdate"](data); // pass update to frontend UI
      }
    });

    socket.on("lookup_update_error", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.error("⚠️ Lookup update error:", data);
        callbacks[room]["onError"](data);
      }
    });

    socket.on("recommend_similar_products", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.log("📦 Received similar products:", data);
        callbacks[room]["onSimilar"](data); // pass similar products to frontend UI
      }
    });

    socket.on("recommend_similar_products_error", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.error("⚠️ Similar products error:", data);
        callbacks[room]["onSimilarError"](data);
      }
    });

    socket.on("essentials", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.log("📦 Received essentials:", data);
        var x = data.essentials.map((name, index) => ({
          id: (index + 1).toString(),
          name,
        }));
        console.log("📦 Essentials transformed:", x);
        room = room.split("-").pop();
        callbacks[room]["onEssentials"](x);
      }
    });

    socket.on("essentials_error", ({ room, data }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.log("⚠️ Essentials error:", data);
        callbacks[room]["onEssentialsError"](data);
      }
    });

    socket.on("room_ready", ({ room }) => {
      room = room.split("-").pop();
      if (callbacks[room]) {
        console.log("🎉 Room join complete and ready:", room, callbacks);
        callbacks[room]["onReady"]();
      }
    });
  }
};

export function joinProductRoom(upcOrId, {onUpdate, onError, onSimilar, onSimilarError, onEssentials, onEssentialsError, onReady}) {
  if (!socket) {
    connectSocket(constToken, () => {
      joinProductRoom(upcOrId, {onUpdate, onError, onSimilar, onSimilarError, onEssentials, onEssentialsError, onReady});
    });
    return;
  }

  callbacks[upcOrId] = {
    onUpdate,
    onError,
    onSimilar,
    onSimilarError,
    onEssentials,
    onEssentialsError,
    onReady
  };

  socket.emit("join_room", { upcOrId, token: constToken });
};

// Function to leave a room
export const leaveProductRoom = (upcOrId) => {
  if (callbacks[upcOrId]) {
    delete callbacks[upcOrId];
  }
  if (!socket) return;
  socket.emit("leave_room", { upcOrId, token: constToken});
};


// --- DISCONNECT SOCKET ---
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// --- LOOKUP FUNCTION ---
export async function lookupbyid(id) {
  const token = await getToken();
  try {
    const res = await axios.post(
      `${API_URL}/lookupbyid`,
      { dsld_id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Immediate partial response (fast)
    return true; 
  } catch (e) {
    throw e.response?.data?.msg || "Lookup failed";
  }
}