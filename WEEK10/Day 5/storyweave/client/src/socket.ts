import { io, type Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
    auth: (cb) => cb({ token: getToken() }),
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
