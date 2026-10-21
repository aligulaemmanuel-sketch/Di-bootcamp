import type { Server } from "socket.io";

let io: Server | null = null;

export function setIO(server: Server) {
  io = server;
}

/** Lets REST routes push realtime events (e.g. "comment:refresh"). */
export function getIO(): Server | null {
  return io;
}

export function storyRoom(storyId: string) {
  return `story:${storyId}`;
}
