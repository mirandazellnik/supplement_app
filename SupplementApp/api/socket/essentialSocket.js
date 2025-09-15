import { getSocket, getToken, connectSocket, setCallbacks } from "./socket";

export function joinEssentialRoom(essentialName, {e_onProductsUpdate, e_onProductsError}) {
    const socket = getSocket();
    const constToken = getToken();

    if (!socket) {
    connectSocket(constToken, () => {
      joinEssentialRoom(essentialName, {e_onProductsUpdate, e_onProductsError});
    });
    return;
  }

  setCallbacks(essentialName, {
    e_onProductsUpdate,
    e_onProductsError
  });

  socket.emit("join_room", { essentialName: "e_" + essentialName, token: constToken });
};