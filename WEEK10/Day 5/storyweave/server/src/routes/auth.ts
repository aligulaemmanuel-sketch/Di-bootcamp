import { Router } from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/tokens";
import { passwordResetRequestSchema, passwordResetSchema, registerSchema, loginSchema } from "../lib/validate";
import { ah } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { config } from "../config";
import { z } from "zod";
import { createEmailTransport } from "../lib/email";

export const authRouter = Router();
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function publicUser(u: { id: string; email: string; username: string; bio: string; avatarUrl: string | null; coverImageUrl: string | null }) {
  return { id: u.id, email: u.email, username: u.username, bio: u.bio, avatarUrl: u.avatarUrl, coverImageUrl: u.coverImageUrl };
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

authRouter.post("/forgot-password", ah(async (req, res) => {
  const { email } = passwordResetRequestSchema.parse(req.body);
  let transport;
  try {
    transport = createEmailTransport();
  } catch {
    return res.status(503).json({ error: "Password recovery email is not configured. Contact the site administrator." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const resetUrl = `${config.clientUrl.split(",")[0].trim().replace(/\/$/, "")}/reset-password/${token}`;
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt },
    });

    try {
      await transport.sendMail({
        from: config.gmail.from,
        to: user.email,
        subject: "Reset your StoryWeave password",
        text: `We received a request to reset the password for your StoryWeave account. Reset it within one hour: ${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>We received a request to reset the password for your StoryWeave account.</p><p><a href="${escapeHtml(resetUrl)}">Choose a new password</a></p><p>This link expires in one hour. If you didn't request this, you can ignore this email.</p>`,
      });
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, tokenHash: hashResetToken(token) } });
      console.error("Failed to send StoryWeave password recovery email.", error);
      return res.status(502).json({ error: "The recovery email could not be sent. Check the email service configuration and try again." });
    }
  }

  res.json({ message: "If an account exists for that email, password reset instructions have been sent." });
}));

authRouter.post("/reset-password", ah(async (req, res) => {
  const { token, password } = passwordResetSchema.parse(req.body);
  const tokenHash = hashResetToken(token);
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);

  const reset = await prisma.$transaction(async (tx) => {
    const validToken = await tx.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    });
    if (!validToken) return false;

    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: validToken.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count !== 1) return false;

    await tx.user.update({ where: { id: validToken.userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({
      where: { userId: validToken.userId, id: { not: validToken.id } },
    });
    return true;
  });

  if (!reset) return res.status(400).json({ error: "This password reset link is invalid or has expired. Request a new one." });
  res.json({ message: "Your password has been reset. You can now sign in." });
}));

authRouter.post("/google", ah(async (req, res) => {
  const { credential } = z.object({ credential: z.string().min(1) }).parse(req.body);
  if (!config.googleClientId) {
    return res.status(503).json({ error: "Google sign-in is not configured on the server." });
  }

  let payload;
  try {
    const ticket = await new OAuth2Client(config.googleClientId).verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Google sign-in could not verify your account." });
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    return res.status(401).json({ error: "Use a Google account with a verified email address." });
  }

  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing?.googleId && existing.googleId !== payload.sub) {
      return res.status(409).json({ error: "This email is already linked to another Google account." });
    }
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: payload.sub, ...(!existing.avatarUrl && payload.picture && { avatarUrl: payload.picture }) },
      });
    } else {
      const base = (payload.name || payload.email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24);
      const usernameBase = base.length >= 3 ? base : "writer";
      let username = usernameBase;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${usernameBase.slice(0, 22)}_${randomBytes(3).toString("hex")}`;
      }
      user = await prisma.user.create({
        data: {
          email: payload.email,
          username,
          googleId: payload.sub,
          avatarUrl: payload.picture,
        },
      });
    }
  }

  res.json({ user: publicUser(user), token: signToken({ sub: user.id, username: user.username }) });
}));

authRouter.get("/me", requireAuth, ah(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
}));

authRouter.patch("/me", requireAuth, ah(async (req, res) => {
  const { bio, avatarUrl, coverImageUrl } = req.body ?? {};
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { ...(bio !== undefined && { bio: String(bio).slice(0, 300) }),
            ...(avatarUrl !== undefined && { avatarUrl: String(avatarUrl) }),
            ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl === null ? null : String(coverImageUrl) }) },
  });
  res.json({ user: publicUser(user) });
}));
