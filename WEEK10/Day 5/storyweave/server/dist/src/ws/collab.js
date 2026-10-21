"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCollab = setupCollab;
const tokens_1 = require("../lib/tokens");
const access_1 = require("../lib/access");
const prisma_1 = require("../lib/prisma");
const io_1 = require("./io");
const roomPresence = new Map();
function colorFor(id) {
    let h = 0;
    for (const ch of id)
        h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${h}, 70%, 45%)`;
}
function setupCollab(io) {
    // Authenticate every socket with the same JWT as the REST API
    io.use((socket, next) => {
        try {
            const payload = (0, tokens_1.verifyToken)(String(socket.handshake.auth?.token ?? ""));
            socket.data.user = payload;
            next();
        }
        catch {
            next(new Error("unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const me = socket.data.user;
        let joinedRoom = null;
        socket.on("story:join", async (storyId, cb) => {
            const role = await (0, access_1.getRole)(me.sub, storyId);
            const story = await prisma_1.prisma.story.findUnique({ where: { id: storyId } });
            if (!story || !role)
                return cb?.({ error: "Not a collaborator on this story." });
            joinedRoom = (0, io_1.storyRoom)(storyId);
            await socket.join(joinedRoom);
            const users = roomPresence.get(joinedRoom) ?? new Map();
            users.set(socket.id, { userId: me.sub, username: me.username, color: colorFor(me.sub) });
            roomPresence.set(joinedRoom, users);
            io.to(joinedRoom).emit("presence", [...users.values()]);
            cb?.({ ok: true, role });
        });
        // Real-time editing: persist + broadcast to other collaborators (last-write-wins)
        socket.on("story:update", async ({ storyId, title, content }) => {
            if (!joinedRoom || joinedRoom !== (0, io_1.storyRoom)(storyId))
                return;
            const role = await (0, access_1.getRole)(me.sub, storyId);
            if (!(0, access_1.canEdit)(role))
                return;
            const story = await prisma_1.prisma.story.update({
                where: { id: storyId },
                data: { ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
            });
            socket.to(joinedRoom).emit("story:updated", { title: story.title, content: story.content, by: me.sub });
        });
        // Bonus: broadcast cursor position so collaborators see where others are editing
        socket.on("cursor", ({ storyId, position }) => {
            if (!joinedRoom)
                return;
            socket.to(joinedRoom).emit("cursor", { userId: me.sub, username: me.username, color: colorFor(me.sub), position });
        });
        socket.on("disconnect", () => {
            if (!joinedRoom)
                return;
            const users = roomPresence.get(joinedRoom);
            if (users) {
                users.delete(socket.id);
                io.to(joinedRoom).emit("presence", [...users.values()]);
                if (users.size === 0)
                    roomPresence.delete(joinedRoom);
            }
        });
    });
}
