"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const asyncHandler_1 = require("../lib/asyncHandler");
exports.usersRouter = (0, express_1.Router)();
// Public profile: user details + their stories
exports.usersRouter.get("/:username", (0, asyncHandler_1.ah)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { username: req.params.username },
        select: { id: true, username: true, bio: true, avatarUrl: true, createdAt: true },
    });
    if (!user)
        return res.status(404).json({ error: "User not found." });
    const stories = await prisma_1.prisma.story.findMany({
        where: { authorId: user.id },
        include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
        orderBy: { updatedAt: "desc" },
    });
    const collaborations = await prisma_1.prisma.storyCollaborator.findMany({
        where: { userId: user.id, role: { in: ["EDITOR", "VIEWER"] } },
        include: { story: { include: { author: { select: { username: true } } } } },
    });
    res.json({ user, stories, collaborations: collaborations.map((c) => ({ role: c.role, story: c.story })) });
}));
