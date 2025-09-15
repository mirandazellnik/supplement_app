import { getSocket, connectSocket, getToken, setCallbacks } from "./socket";

export function joinProductRoom(upcOrId, {onUpdate, onError, onSimilar, onSimilarError, onEssentials, onEssentialsError, onReady}) {
    const socket = getSocket();
    const constToken = getToken();

    if (!socket) {
    connectSocket(constToken, () => {
      joinProductRoom(upcOrId, {onUpdate, onError, onSimilar, onSimilarError, onEssentials, onEssentialsError, onReady});
    });
    return;
  }

  setCallbacks(upcOrId, {
    onUpdate,
    onError,
    onSimilar,
    onSimilarError,
    onEssentials,
    onEssentialsError,
    onReady
  });

  socket.emit("join_room", { upcOrId, token: constToken });
};
