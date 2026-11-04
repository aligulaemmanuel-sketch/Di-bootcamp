import { createHash, randomBytes } from "node:crypto";

export function createInvitationToken() {
  return createOpaqueToken();
}

export function createOpaqueToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInvitationToken(token) };
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
