import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ah } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getRole, canEdit, canModerate } from "../lib/access";
import { getIO, storyRoom } from "../ws/io";

export const storiesRouter = Router();

const storyInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  collaborators: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
  _count: { select: { comments: true } },
} as const;

// Feed: ?filter=feed|mine|shared
storiesRouter.get("/", requireAuth, ah(async (req, res) => {
  const filter = String(req.query.filter || "feed");
  const where: Prisma.StoryWhereInput =
    filter === "mine"
      ? { authorId: req.user!.id }
      : filter === "shared"
        ? { collaborators: { some: { userId: req.user!.id, role: { in: ["EDITOR", "VIEWER"] } } } }
        : {}; // feed = every story in this demo app
  const stories = await prisma.story.findMany({
    where,
    include: storyInclude,
    orderBy: { updatedAt: "desc" },
  });
  res.json({ stories });
}));

storiesRouter.post("/", requireAuth, ah(async (req, res) => {
  const data = z.object({
    title: z.string().min(1, "Title is required").max(120),
    genre: z.string().max(40).optional(),
    content: z.string().optional(),
  }).parse(req.body);

  const story = await prisma.story.create({
    data: {
      title: data.title,
      genre: data.genre || "General",
      content: data.content ?? "",
      authorId: req.user!.id,
      collaborators: { create: { userId: req.user!.id, role: "OWNER" } },
    },
    include: storyInclude,
  });
  res.status(201).json({ story });
}));

storiesRouter.get("/:id", requireAuth, ah(async (req, res) => {
  const story = await prisma.story.findUnique({ where: { id: req.params.id }, include: storyInclude });
  if (!story) return res.status(404).json({ error: "Story not found." });
  res.json({ story, role: await getRole(req.user!.id, story.id) });
}));

storiesRouter.patch("/:id", requireAuth, ah(async (req, res) => {
  const role = await getRole(req.user!.id, req.params.id);
  if (!canEdit(role)) return res.status(403).json({ error: "Only editors can update this story." });

  const schema = z.object({
    title: z.string().min(1).max(120).optional(),
    genre: z.string().max(40).optional(),
    content: z.string().optional(),
    commentsEnabled: z.boolean().optional(),
  });
  const data = schema.parse(req.body);

  // Comments toggle is an owner/moderation power
  if (data.commentsEnabled !== undefined && !canModerate(role)) {
    return res.status(403).json({ error: "Only the owner can enable/disable comments." });
  }

  const story = await prisma.story.update({ where: { id: req.params.id }, data, include: storyInclude });
  getIO()?.to(storyRoom(story.id)).emit("story:updated", { title: story.title, content: story.content, by: req.user!.id });
  res.json({ story, role });
}));

storiesRouter.delete("/:id", requireAuth, ah(async (req, res) => {
  const role = await getRole(req.user!.id, req.params.id);
  if (!canModerate(role)) return res.status(403).json({ error: "Only the owner can delete this story." });
  await prisma.story.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Add a collaborator by username
storiesRouter.post("/:id/collaborators", requireAuth, ah(async (req, res) => {
  const role = await getRole(req.user!.id, req.params.id);
  if (!canModerate(role)) return res.status(403).json({ error: "Only the owner can add collaborators." });

  const { username, role: newRole } = z
    .object({ username: z.string(), role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR") })
    .parse(req.body);

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(404).json({ error: "No user with that username." });

  await prisma.storyCollaborator.upsert({
    where: { storyId_userId: { storyId: req.params.id, userId: user.id } },
    create: { storyId: req.params.id, userId: user.id, role: newRole },
    update: { role: newRole },
  });
  const story = await prisma.story.findUnique({ where: { id: req.params.id }, include: storyInclude });
  res.json({ story });
}));

/* ------------------------- share links (no auth needed) ------------------------- */

export const shareRouter = Router();

shareRouter.get("/:token", ah(async (req, res) => {
  const story = await prisma.story.findUnique({
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
  if (!story) return res.status(404).json({ error: "Shared story not found." });
  const { shareToken: _omit, ...publicStory } = story;
  res.json({ story: publicStory });
}));
