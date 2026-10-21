"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareRouter = exports.storiesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const asyncHandler_1 = require("../lib/asyncHandler");
const auth_1 = require("../middleware/auth");
const access_1 = require("../lib/access");
const io_1 = require("../ws/io");
exports.storiesRouter = (0, express_1.Router)();
const storyInclude = {
    author: { select: { id: true, username: true, avatarUrl: true } },
    collaborators: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
    _count: { select: { comments: true } },
};
// Feed: ?filter=feed|mine|shared
exports.storiesRouter.get("/", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const filter = String(req.query.filter || "feed");
    const where = filter === "mine"
        ? { authorId: req.user.id }
        : filter === "shared"
            ? { collaborators: { some: { userId: req.user.id, role: { in: ["EDITOR", "VIEWER"] } } } }
            : {}; // feed = every story in this demo app
    const stories = await prisma_1.prisma.story.findMany({
        where,
        include: storyInclude,
        orderBy: { updatedAt: "desc" },
    });
    res.json({ stories });
}));
exports.storiesRouter.post("/", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const data = zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required").max(120),
        genre: zod_1.z.string().max(40).optional(),
        content: zod_1.z.string().optional(),
    }).parse(req.body);
    const story = await prisma_1.prisma.story.create({
        data: {
            title: data.title,
            genre: data.genre || "General",
            content: data.content ?? "",
            authorId: req.user.id,
            collaborators: { create: { userId: req.user.id, role: "OWNER" } },
        },
        include: storyInclude,
    });
    res.status(201).json({ story });
}));
exports.storiesRouter.get("/:id", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const story = await prisma_1.prisma.story.findUnique({ where: { id: req.params.id }, include: storyInclude });
    if (!story)
        return res.status(404).json({ error: "Story not found." });
    res.json({ story, role: await (0, access_1.getRole)(req.user.id, story.id) });
}));
exports.storiesRouter.patch("/:id", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const role = await (0, access_1.getRole)(req.user.id, req.params.id);
    if (!(0, access_1.canEdit)(role))
        return res.status(403).json({ error: "Only editors can update this story." });
    const schema = zod_1.z.object({
        title: zod_1.z.string().min(1).max(120).optional(),
        genre: zod_1.z.string().max(40).optional(),
        content: zod_1.z.string().optional(),
        commentsEnabled: zod_1.z.boolean().optional(),
    });
    const data = schema.parse(req.body);
    // Comments toggle is an owner/moderation power
    if (data.commentsEnabled !== undefined && !(0, access_1.canModerate)(role)) {
        return res.status(403).json({ error: "Only the owner can enable/disable comments." });
    }
    const story = await prisma_1.prisma.story.update({ where: { id: req.params.id }, data, include: storyInclude });
    (0, io_1.getIO)()?.to((0, io_1.storyRoom)(story.id)).emit("story:updated", { title: story.title, content: story.content, by: req.user.id });
    res.json({ story, role });
}));
exports.storiesRouter.delete("/:id", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const role = await (0, access_1.getRole)(req.user.id, req.params.id);
    if (!(0, access_1.canModerate)(role))
        return res.status(403).json({ error: "Only the owner can delete this story." });
    await prisma_1.prisma.story.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
// Add a collaborator by username
exports.storiesRouter.post("/:id/collaborators", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const role = await (0, access_1.getRole)(req.user.id, req.params.id);
    if (!(0, access_1.canModerate)(role))
        return res.status(403).json({ error: "Only the owner can add collaborators." });
    const { username, role: newRole } = zod_1.z
        .object({ username: zod_1.z.string(), role: zod_1.z.enum(["EDITOR", "VIEWER"]).default("EDITOR") })
        .parse(req.body);
    const user = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(404).json({ error: "No user with that username." });
    await prisma_1.prisma.storyCollaborator.upsert({
        where: { storyId_userId: { storyId: req.params.id, userId: user.id } },
        create: { storyId: req.params.id, userId: user.id, role: newRole },
        update: { role: newRole },
    });
    const story = await prisma_1.prisma.story.findUnique({ where: { id: req.params.id }, include: storyInclude });
    res.json({ story });
}));
/* ------------------------- share links (no auth needed) ------------------------- */
exports.shareRouter = (0, express_1.Router)();
exports.shareRouter.get("/:token", (0, asyncHandler_1.ah)(async (req, res) => {
    const story = await prisma_1.prisma.story.findUnique({
        where: { shareToken: req.params.token },
        include: {
            author: { select: { username: true, avatarUrl: true } },
            comments: {
                include: { author: { select: { username: true, avatarUrl: true } },
                    reactions: { include: { user: { select: { id: true, username: true } } } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });
    if (!story)
        return res.status(404).json({ error: "Shared story not found." });
    const { shareToken: _omit, ...publicStory } = story;
    res.json({ story: publicStory });
}));
