import type { Server } from "socket.io";
import { verifyToken } from "../lib/tokens";
import { getRole, canEdit } from "../lib/access";
import { prisma } from "../lib/prisma";
import { storyRoom } from "./io";

interface PresenceUser {
  userId: string;
  username: string;
  color: string;
}

const roomPresence = new Map<string, Map<string, PresenceUser>>();

function colorFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h}, 70%, 45%)`;
}

export function setupCollab(io: Server) {
  // Authenticate every socket with the same JWT as the REST API
  io.use((socket, next) => {
    try {
      const payload = verifyToken(String(socket.handshake.auth?.token ?? ""));
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const me = socket.data.user as { sub: string; username: string };
    let joinedRoom: string | null = null;

    socket.on("story:join", async (storyId: string, cb?: (res: { ok?: boolean; error?: string; role?: string }) => void) => {
      const role = await getRole(me.sub, storyId);
      const story = await prisma.story.findUnique({ where: { id: storyId } });
      if (!story || !role) return cb?.({ error: "Not a collaborator on this story." });

      joinedRoom = storyRoom(storyId);
      await socket.join(joinedRoom);

      const users = roomPresence.get(joinedRoom) ?? new Map<string, PresenceUser>();
      users.set(socket.id, { userId: me.sub, username: me.username, color: colorFor(me.sub) });
      roomPresence.set(joinedRoom, users);
      io.to(joinedRoom).emit("presence", [...users.values()]);

      cb?.({ ok: true, role });
    });

    // Real-time editing: persist + broadcast to other collaborators (last-write-wins)
    socket.on("story:update", async ({ storyId, title, content }: { storyId: string; title?: string; content?: string }) => {
      if (!joinedRoom || joinedRoom !== storyRoom(storyId)) return;
      const role = await getRole(me.sub, storyId);
      if (!canEdit(role)) return;
      const story = await prisma.story.update({
        where: { id: storyId },
        data: { ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
      });
      socket.to(joinedRoom).emit("story:updated", { title: story.title, content: story.content, by: me.sub });
    });

    // Bonus: broadcast cursor position so collaborators see where others are editing
    socket.on("cursor", ({ storyId, position }: { storyId: string; position: number }) => {
      if (!joinedRoom) return;
      socket.to(joinedRoom).emit("cursor", { userId: me.sub, username: me.username, color: colorFor(me.sub), position });
    });

    socket.on("disconnect", () => {
      if (!joinedRoom) return;
      const users = roomPresence.get(joinedRoom);
      if (users) {
        users.delete(socket.id);
        io.to(joinedRoom).emit("presence", [...users.values()]);
        if (users.size === 0) roomPresence.delete(joinedRoom);
      }
    });
  });
}
