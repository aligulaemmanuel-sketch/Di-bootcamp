import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ah } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getRole, canEdit } from "../lib/access";
import { getIO, storyRoom } from "../ws/io";

export const versionsRouter = Router();

versionsRouter.get("/:id/versions", requireAuth, ah(async (req, res) => {
  if (!(await getRole(req.user!.id, req.params.id))) return res.status(403).json({ error: "Not a collaborator." });
  const versions = await prisma.storyVersion.findMany({
    where: { storyId: req.params.id },
    include: { savedBy: { select: { username: true } } },
    orderBy: { versionNumber: "desc" },
  });
  res.json({ versions });
}));

// Save a snapshot of the story's current state
versionsRouter.post("/:id/versions", requireAuth, ah(async (req, res) => {
  const role = await getRole(req.user!.id, req.params.id);
  if (!canEdit(role)) return res.status(403).json({ error: "Only editors can save versions." });

  const { label } = z.object({ label: z.string().max(80).optional() }).parse(req.body);
  const story = await prisma.story.findUnique({ where: { id: req.params.id } });
  if (!story) return res.status(404).json({ error: "Story not found." });

  const last = await prisma.storyVersion.aggregate({ where: { storyId: story.id }, _max: { versionNumber: true } });
  const version = await prisma.storyVersion.create({
    data: {
      storyId: story.id,
      versionNumber: (last._max.versionNumber ?? 0) + 1,
      title: story.title,
      content: story.content,
      label: label ?? "",
      savedById: req.user!.id,
    },
    include: { savedBy: { select: { username: true } } },
  });
  res.status(201).json({ version });
}));

export const versionActionsRouter = Router();

// Restore a version -> overwrites the story and records a new version
versionActionsRouter.post("/:id/restore", requireAuth, ah(async (req, res) => {
  const version = await prisma.storyVersion.findUnique({ where: { id: req.params.id }, include: { story: true } });
  if (!version) return res.status(404).json({ error: "Version not found." });

  const role = await getRole(req.user!.id, version.storyId);
  if (!canEdit(role)) return res.status(403).json({ error: "Only editors can restore versions." });

  const story = await prisma.story.update({
    where: { id: version.storyId },
    data: { title: version.title, content: version.content },
  });
  const last = await prisma.storyVersion.aggregate({ where: { storyId: story.id }, _max: { versionNumber: true } });
  const snapshot = await prisma.storyVersion.create({
    data: {
      storyId: story.id,
      versionNumber: (last._max.versionNumber ?? 0) + 1,
      title: story.title,
      content: story.content,
      label: `Restored from v${version.versionNumber}`,
      savedById: req.user!.id,
    },
  });
  getIO()?.to(storyRoom(story.id)).emit("story:updated", { title: story.title, content: story.content, by: req.user!.id });
  res.json({ story, snapshot });
}));
