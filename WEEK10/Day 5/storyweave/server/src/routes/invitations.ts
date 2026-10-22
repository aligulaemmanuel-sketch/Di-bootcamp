import { createHash, randomBytes } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { createEmailTransport } from "../lib/email";
import { ah } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { canModerate, getRole } from "../lib/access";

export const storyInvitationsRouter = Router();
export const invitationsRouter = Router();

const EXPIRATION_DAYS = 7;

function hashToken(token: string) {
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

storyInvitationsRouter.post("/:storyId/invitations", requireAuth, ah(async (req, res) => {
  const storyId = String(req.params.storyId);
  const role = await getRole(req.user!.id, storyId);
  if (!canModerate(role)) return res.status(403).json({ error: "Only the story owner can send invitations." });

  const data = z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
  }).parse(req.body);

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { author: { select: { username: true } } },
  });
  if (!story) return res.status(404).json({ error: "Story not found." });

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    const existingCollaborator = await prisma.storyCollaborator.findUnique({
      where: { storyId_userId: { storyId, userId: existingUser.id } },
    });
    if (existingCollaborator) return res.status(409).json({ error: "This person already has access to the story." });
  }

  let transport;
  try {
    transport = createEmailTransport();
  } catch {
    return res.status(503).json({ error: "Email invitations are not configured. Add Gmail SMTP settings to the server environment." });
  }

  const token = randomBytes(32).toString("hex");
  const invitation = await prisma.storyInvitation.create({
    data: {
      storyId,
      invitedById: req.user!.id,
      email: data.email,
      role: data.role,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  const inviteUrl = `${config.clientUrl.split(",")[0].trim().replace(/\/$/, "")}/invite/${token}`;
  const storyTitle = escapeHtml(story.title);
  const inviter = escapeHtml(story.author.username);
  try {
    await transport.sendMail({
      from: config.gmail.from,
      to: data.email,
      subject: `${story.author.username} invited you to collaborate on "${story.title}"`,
      text: `${story.author.username} invited you to ${data.role.toLowerCase()} the story "${story.title}" on StoryWeave.\n\nAccept your invitation within ${EXPIRATION_DAYS} days: ${inviteUrl}`,
      html: `<p><strong>${inviter}</strong> invited you to ${data.role.toLowerCase()} the story <strong>${storyTitle}</strong> on StoryWeave.</p><p>This invitation expires in ${EXPIRATION_DAYS} days.</p><p><a href="${inviteUrl}">Accept invitation</a></p>`,
    });
  } catch (error) {
    await prisma.storyInvitation.delete({ where: { id: invitation.id } });
    console.error("Failed to send StoryWeave invitation email.", error);
    return res.status(502).json({ error: "The invitation email could not be sent. Check the Gmail SMTP settings and try again." });
  }

  res.status(201).json({ invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt } });
}));

invitationsRouter.get("/:token", ah(async (req, res) => {
  const invitation = await prisma.storyInvitation.findUnique({
    where: { tokenHash: hashToken(String(req.params.token)) },
    include: {
      story: { select: { id: true, title: true, genre: true } },
      invitedBy: { select: { username: true } },
    },
  });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
    return res.status(404).json({ error: "This invitation is invalid or has expired." });
  }

  res.json({
    invitation: {
      story: invitation.story,
      invitedBy: invitation.invitedBy.username,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    },
  });
}));

invitationsRouter.post("/:token/accept", requireAuth, ah(async (req, res) => {
  const tokenHash = hashToken(String(req.params.token));
  const invitation = await prisma.storyInvitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
    return res.status(404).json({ error: "This invitation is invalid or has expired." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true } });
  if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return res.status(403).json({ error: "Sign in with the email address that received this invitation." });
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.storyInvitation.findUnique({ where: { id: invitation.id } });
    if (!current || current.acceptedAt || current.expiresAt <= new Date()) return null;

    await tx.storyCollaborator.upsert({
      where: { storyId_userId: { storyId: current.storyId, userId: req.user!.id } },
      create: { storyId: current.storyId, userId: req.user!.id, role: current.role },
      update: { role: current.role },
    });
    await tx.storyInvitation.update({ where: { id: current.id }, data: { acceptedAt: new Date() } });
    return { storyId: current.storyId, role: current.role };
  });

  if (!result) return res.status(409).json({ error: "This invitation has already been accepted or has expired." });
  res.json({ storyId: result.storyId, role: result.role });
}));
