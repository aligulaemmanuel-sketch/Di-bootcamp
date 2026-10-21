"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentActionsRouter = exports.commentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const asyncHandler_1 = require("../lib/asyncHandler");
const auth_1 = require("../middleware/auth");
const access_1 = require("../lib/access");
const io_1 = require("../ws/io");
exports.commentsRouter = (0, express_1.Router)();
exports.commentActionsRouter = (0, express_1.Router)();
const commentInclude = {
    author: { select: { id: true, username: true, avatarUrl: true } },
    reactions: { include: { user: { select: { id: true, username: true } } } },
};
const notify = (storyId) => (0, io_1.getIO)()?.to((0, io_1.storyRoom)(storyId)).emit("comment:refresh");
exports.commentsRouter.post("/:id/comments", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const story = await prisma_1.prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story)
        return res.status(404).json({ error: "Story not found." });
    if (!story.commentsEnabled)
        return res.status(403).json({ error: "Comments are disabled for this story." });
    const { content } = zod_1.z.object({ content: zod_1.z.string().min(1).max(1000) }).parse(req.body);
    const comment = await prisma_1.prisma.comment.create({
        data: { storyId: story.id, authorId: req.user.id, content },
        include: commentInclude,
    });
    notify(story.id);
    res.status(201).json({ comment });
}));
exports.commentsRouter.get("/:id/comments", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const comments = await prisma_1.prisma.comment.findMany({
        where: { storyId: req.params.id },
        include: commentInclude,
        orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
}));
exports.commentActionsRouter.patch("/:id", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment)
        return res.status(404).json({ error: "Comment not found." });
    if (comment.authorId !== req.user.id)
        return res.status(403).json({ error: "You can only edit your own comments." });
    const { content } = zod_1.z.object({ content: zod_1.z.string().min(1).max(1000) }).parse(req.body);
    const updated = await prisma_1.prisma.comment.update({ where: { id: comment.id }, data: { content }, include: commentInclude });
    notify(comment.storyId);
    res.json({ comment: updated });
}));
exports.commentActionsRouter.delete("/:id", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment)
        return res.status(404).json({ error: "Comment not found." });
    const role = await (0, access_1.getRole)(req.user.id, comment.storyId);
    if (comment.authorId !== req.user.id && !(0, access_1.canModerate)(role)) {
        return res.status(403).json({ error: "You can only delete your own comments." });
    }
    await prisma_1.prisma.comment.delete({ where: { id: comment.id } });
    notify(comment.storyId);
    res.status(204).send();
}));
// Toggle a reaction (add if absent, remove if present)
exports.commentActionsRouter.post("/:id/reactions", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const { emoji } = zod_1.z.object({ emoji: zod_1.z.string().min(1).max(8) }).parse(req.body);
    const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment)
        return res.status(404).json({ error: "Comment not found." });
    const key = { commentId: comment.id, userId: req.user.id, emoji };
    const existing = await prisma_1.prisma.commentReaction.findUnique({ where: { commentId_userId_emoji: key } });
    if (existing)
        await prisma_1.prisma.commentReaction.delete({ where: { commentId_userId_emoji: key } });
    else
        await prisma_1.prisma.commentReaction.create({ data: key });
    const reactions = await prisma_1.prisma.commentReaction.findMany({ where: { commentId: comment.id },
        include: { user: { select: { id: true, username: true } } } });
    notify(comment.storyId);
    res.json({ reactions });
}));
