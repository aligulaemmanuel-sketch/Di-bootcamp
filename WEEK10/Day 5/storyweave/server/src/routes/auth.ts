import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/tokens";
import { registerSchema, loginSchema } from "../lib/validate";
import { ah } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

function publicUser(u: { id: string; email: string; username: string; bio: string; avatarUrl: string | null }) {
  return { id: u.id, email: u.email, username: u.username, bio: u.bio, avatarUrl: u.avatarUrl };
}

authRouter.post("/register", ah(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });
  if (existing) return res.status(409).json({ error: "Email or username is already taken." });

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, username: data.username, passwordHash, bio: data.bio ?? "" },
  });
  res.status(201).json({ user: publicUser(user), token: signToken({ sub: user.id, username: user.username }) });
}));

authRouter.post("/login", ah(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinva");
  if (!user || !ok) return res.status(401).json({ error: "Invalid credentials." });

  res.json({ user: publicUser(user), token: signToken({ sub: user.id, username: user.username }) });
}));

authRouter.get("/me", requireAuth, ah(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
}));

authRouter.patch("/me", requireAuth, ah(async (req, res) => {
  const { bio, avatarUrl } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { ...(bio !== undefined && { bio: String(bio).slice(0, 300) }),
            ...(avatarUrl !== undefined && { avatarUrl: String(avatarUrl) }) },
  });
  res.json({ user: publicUser(user) });
}));
