import { Router } from "express";
import { prisma } from "../lib/prisma";
import { ah } from "../lib/asyncHandler";

export const usersRouter = Router();

// Public profile: user details + their stories
usersRouter.get("/:username", ah(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: { id: true, username: true, bio: true, avatarUrl: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "User not found." });

  const stories = await prisma.story.findMany({
    where: { authorId: user.id },
    include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const collaborations = await prisma.storyCollaborator.findMany({
    where: { userId: user.id, role: { in: ["EDITOR", "VIEWER"] } },
    include: { story: { include: { author: { select: { username: true } } } } },
  });

  res.json({ user, stories, collaborations: collaborations.map((c) => ({ role: c.role, story: c.story })) });
}));
