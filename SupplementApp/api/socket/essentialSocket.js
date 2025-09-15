import { getSocket, getToken, connectSocket, setCallbacks } from "./socket";

export function joinEssentialRoom(essentialName, {e_onProducts, e_onProductsError, onReady}) {
  const socket = getSocket();
  const constToken = getToken();

  if (!socket) {
  connectSocket(constToken, () => {
    joinEssentialRoom(essentialName, {e_onProducts, e_onProductsError, onReady});
  });
  return;
  }

  setCallbacks("e_" + essentialName, {
    e_onProducts,
    e_onProductsError,
    onReady
  });

  socket.emit("join_room", { upcOrId: "e_" + essentialName, token: constToken });
};