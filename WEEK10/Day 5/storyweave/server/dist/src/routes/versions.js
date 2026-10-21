"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionActionsRouter = exports.versionsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const asyncHandler_1 = require("../lib/asyncHandler");
const auth_1 = require("../middleware/auth");
const access_1 = require("../lib/access");
const io_1 = require("../ws/io");
exports.versionsRouter = (0, express_1.Router)();
exports.versionsRouter.get("/:id/versions", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    if (!(await (0, access_1.getRole)(req.user.id, req.params.id)))
        return res.status(403).json({ error: "Not a collaborator." });
    const versions = await prisma_1.prisma.storyVersion.findMany({
        where: { storyId: req.params.id },
        include: { savedBy: { select: { username: true } } },
        orderBy: { versionNumber: "desc" },
    });
    res.json({ versions });
}));
// Save a snapshot of the story's current state
exports.versionsRouter.post("/:id/versions", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const role = await (0, access_1.getRole)(req.user.id, req.params.id);
    if (!(0, access_1.canEdit)(role))
        return res.status(403).json({ error: "Only editors can save versions." });
    const { label } = zod_1.z.object({ label: zod_1.z.string().max(80).optional() }).parse(req.body);
    const story = await prisma_1.prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story)
        return res.status(404).json({ error: "Story not found." });
    const last = await prisma_1.prisma.storyVersion.aggregate({ where: { storyId: story.id }, _max: { versionNumber: true } });
    const version = await prisma_1.prisma.storyVersion.create({
        data: {
            storyId: story.id,
            versionNumber: (last._max.versionNumber ?? 0) + 1,
            title: story.title,
            content: story.content,
            label: label ?? "",
            savedById: req.user.id,
        },
        include: { savedBy: { select: { username: true } } },
    });
    res.status(201).json({ version });
}));
exports.versionActionsRouter = (0, express_1.Router)();
// Restore a version -> overwrites the story and records a new version
exports.versionActionsRouter.post("/:id/restore", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const version = await prisma_1.prisma.storyVersion.findUnique({ where: { id: req.params.id }, include: { story: true } });
    if (!version)
        return res.status(404).json({ error: "Version not found." });
    const role = await (0, access_1.getRole)(req.user.id, version.storyId);
    if (!(0, access_1.canEdit)(role))
        return res.status(403).json({ error: "Only editors can restore versions." });
    const story = await prisma_1.prisma.story.update({
        where: { id: version.storyId },
        data: { title: version.title, content: version.content },
    });
    const last = await prisma_1.prisma.storyVersion.aggregate({ where: { storyId: story.id }, _max: { versionNumber: true } });
    const snapshot = await prisma_1.prisma.storyVersion.create({
        data: {
            storyId: story.id,
            versionNumber: (last._max.versionNumber ?? 0) + 1,
            title: story.title,
            content: story.content,
            label: `Restored from v${version.versionNumber}`,
            savedById: req.user.id,
        },
    });
    (0, io_1.getIO)()?.to((0, io_1.storyRoom)(story.id)).emit("story:updated", { title: story.title, content: story.content, by: req.user.id });
    res.json({ story, snapshot });
}));
