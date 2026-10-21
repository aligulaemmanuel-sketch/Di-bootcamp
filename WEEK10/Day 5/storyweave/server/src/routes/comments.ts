import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ah } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getRole, canModerate } from "../lib/access";
import { getIO, storyRoom } from "../ws/io";

export const commentsRouter = Router();
export const commentActionsRouter = Router();

const commentInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  reactions: { include: { user: { select: { id: true, username: true } } } },
} as const;

const notify = (storyId: string) => getIO()?.to(storyRoom(storyId)).emit("comment:refresh");

commentsRouter.post("/:id/comments", requireAuth, ah(async (req, res) => {
  const story = await prisma.story.findUnique({ where: { id: req.params.id } });
  if (!story) return res.status(404).json({ error: "Story not found." });
  if (!story.commentsEnabled) return res.status(403).json({ error: "Comments are disabled for this story." });

  const { content } = z.object({ content: z.string().min(1).max(1000) }).parse(req.body);
  const comment = await prisma.comment.create({
    data: { storyId: story.id, authorId: req.user!.id, content },
    include: commentInclude,
  });
  notify(story.id);
  res.status(201).json({ comment });
}));

commentsRouter.get("/:id/comments", requireAuth, ah(async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { storyId: req.params.id },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
  res.json({ comments });
}));

commentActionsRouter.patch("/:id", requireAuth, ah(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) return res.status(404).json({ error: "Comment not found." });
  if (comment.authorId !== req.user!.id) return res.status(403).json({ error: "You can only edit your own comments." });

  const { content } = z.object({ content: z.string().min(1).max(1000) }).parse(req.body);
  const updated = await prisma.comment.update({ where: { id: comment.id }, data: { content }, include: commentInclude });
  notify(comment.storyId);
  res.json({ comment: updated });
}));

commentActionsRouter.delete("/:id", requireAuth, ah(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) return res.status(404).json({ error: "Comment not found." });
  const role = await getRole(req.user!.id, comment.storyId);
  if (comment.authorId !== req.user!.id && !canModerate(role)) {
    return res.status(403).json({ error: "You can only delete your own comments." });
  }
  await prisma.comment.delete({ where: { id: comment.id } });
  notify(comment.storyId);
  res.status(204).send();
}));

// Toggle a reaction (add if absent, remove if present)
commentActionsRouter.post("/:id/reactions", requireAuth, ah(async (req, res) => {
  const { emoji } = z.object({ emoji: z.string().min(1).max(8) }).parse(req.body);
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) return res.status(404).json({ error: "Comment not found." });

  const key = { commentId: comment.id, userId: req.user!.id, emoji };
  const existing = await prisma.commentReaction.findUnique({ where: { commentId_userId_emoji: key } });
  if (existing) await prisma.commentReaction.delete({ where: { commentId_userId_emoji: key } });
  else await prisma.commentReaction.create({ data: key });

  const reactions = await prisma.commentReaction.findMany({ where: { commentId: comment.id },
    include: { user: { select: { id: true, username: true } } } });
  notify(comment.storyId);
  res.json({ reactions });
}));
