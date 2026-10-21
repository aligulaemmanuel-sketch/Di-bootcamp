import type { CollaboratorRole } from "@prisma/client";
import { prisma } from "./prisma";

export async function getRole(userId: string, storyId: string): Promise<CollaboratorRole | null> {
  const row = await prisma.storyCollaborator.findUnique({
    where: { storyId_userId: { storyId, userId } },
  });
  return row?.role ?? null;
}

export function canEdit(role: CollaboratorRole | null): boolean {
  return role === "OWNER" || role === "EDITOR";
}

export function canModerate(role: CollaboratorRole | null): boolean {
  return role === "OWNER";
}

/** True when the user may read the story: collaborator, or any logged-in user
 *  (stories are readable inside the app; share links work without login). */
export function canRead(role: CollaboratorRole | null): boolean {
  return role !== null;
}
