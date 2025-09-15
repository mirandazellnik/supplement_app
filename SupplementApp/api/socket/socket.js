import io from "socket.io-client";

const BASE_URL = require("../api_url.json").api_url;

let socket; // global socket reference
let constToken; // store token for reconnections

let callbacks = {};

function handleSocketEvent(socket, eventName, handlerKey) {
  socket.on(eventName, ({ room, data }) => {
    const id = room.split("-").pop();
    if (callbacks[id]) {
      console.log(`📦 Event: ${eventName}`, data);
      callbacks[id][handlerKey](data);
    }
  });
}

function setupSocket(socket) {
  handleSocketEvent(socket, "lookup_update", "onUpdate");
  handleSocketEvent(socket, "lookup_update_error", "onError");
  handleSocketEvent(socket, "recommend_similar_products", "onSimilar");
  handleSocketEvent(socket, "recommend_similar_products_error", "onSimilarError");
  
  socket.on("essentials", ({ room, data }) => {
    const id = room.split("-").pop();
    if (callbacks[id]) {
      const essentials = data.essentials.map((name, index) => ({
        id: (index + 1).toString(),
        name,
      }));
      console.log("📦 Essentials transformed:", essentials);
      callbacks[id]["onEssentials"](essentials);
    }
  });

  handleSocketEvent(socket, "essentials_error", "onEssentialsError");

  socket.on("room_ready", ({ room }) => {
    const id = room.split("-").pop();
    if (callbacks[id]) {
      console.log("🎉 Room join complete and ready:", id);
      callbacks[id]["onReady"]();
    }
  });

  handleSocketEvent(socket, "e_essential_products", "e_onProducts");
  handleSocketEvent(socket, "e_essential_products_error", "e_onProductsError");
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

    setupSocket(socket);
  }
};

// Function to leave a room
export const leaveRoom = (upcOrId) => {
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

export function getSocket() {
    if (!socket) {
        return null;
    }
    return socket;
}

export function getToken() {
  if (!constToken) {
      return null;
  }
  return constToken;
}

export function setCallbacks(room, newCallbacks) {
  callbacks[room] = newCallbacks;
}