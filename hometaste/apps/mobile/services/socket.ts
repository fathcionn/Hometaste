import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";
import { API_URL } from "./api";

let socket: Socket | null = null;

/**
 * Returns the singleton authenticated Socket.io connection.
 */
export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;
  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
  });

  socket.on("connect_error", (error) => {
    if (error.message === "SOCKET_UNAUTHORIZED" || error.message === "SOCKET_INVALID_TOKEN") {
      void useAuthStore.getState().refreshTokens().then(() => {
        socket?.disconnect();
        socket = null;
        getSocket();
      });
    }
  });

  return socket;
}

/**
 * Disconnects and clears the current Socket.io connection.
 */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
