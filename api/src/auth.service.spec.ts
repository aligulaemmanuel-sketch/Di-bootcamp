import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcryptjs";
import { AuthService } from "./auth.service";
import { PrismaService } from "./prisma.service";
import { createInvitationToken } from "./invitation-token";

function createInvitationService(expiresAt: Date, existingUser?: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  phone: string | null;
  profilePhotoData: null;
}) {
  const { token, tokenHash } = createInvitationToken();
  const invitation = {
    id: "invitation-id",
    tokenHash,
    email: "member@example.com",
    name: "Group member",
    phone: "+254712345678",
    role: "MEMBER",
    groupId: "group-id",
    expiresAt,
    acceptedAt: null as Date | null,
    group: { id: "group-id", name: "Savings group" },
  };
  const users: { id: string; email: string; name: string; passwordHash: string; phone: string | null; profilePhotoData: null }[] = existingUser ? [existingUser] : [];
  const members: { groupId: string; userId: string; name: string; phone: string; role: string }[] = [];
  const auditEvents: { action: string; entityType: string; entityId: string }[] = [];
  const tx = {
    memberInvitation: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) =>
        where.tokenHash === invitation.tokenHash ? invitation : null,
      updateMany: async ({ data }: { data: { acceptedAt: Date } }) => {
        if (invitation.acceptedAt) return { count: 0 };
        invitation.acceptedAt = data.acceptedAt;
        return { count: 1 };
      },
    },
    user: {
      findUnique: async () => existingUser ?? null,
      create: async ({ data }: { data: { email: string; name: string; passwordHash: string; phone?: string } }) => {
        const user = { id: "user-id", ...data, phone: data.phone ?? null, profilePhotoData: null };
        users.push(user);
        return user;
      },
    },
    groupMember: {
      findFirst: async () => null,
      create: async ({ data }: { data: typeof members[number] }) => {
        members.push(data);
        return data;
      },
      updateMany: async () => ({ count: 1 }),
    },
    auditEvent: {
      create: async ({ data }: { data: typeof auditEvents[number] }) => {
        auditEvents.push(data);
        return data;
      },
    },
  };
  const prisma = {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
  } as unknown as PrismaService;
  const jwt = { signAsync: async () => "signed-session" } as unknown as JwtService;
  const mail = { sendMemberInvitation: async () => undefined };
  return {
    auth: new AuthService(prisma, jwt, mail as never),
    token,
    users,
    members,
    auditEvents,
  };
}

function createResetService() {
  const user = {
    id: "user-id",
    email: "member@example.com",
    name: "Group member",
    passwordHash: "old-password-hash",
    tokenVersion: 0,
  };
  const resetTokens: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
  }[] = [];
  const auditEvents: { action: string; entityId: string }[] = [];
  const sentEmails: { email: string; name: string; resetUrl: string }[] = [];
  const tx = {
    passwordResetToken: {
      deleteMany: async ({ where }: { where: { userId: string; id?: { not: string } } }) => {
        for (let index = resetTokens.length - 1; index >= 0; index--) {
          const token = resetTokens[index];
          if (token.userId === where.userId && (!where.id || token.id !== where.id.not)) resetTokens.splice(index, 1);
        }
        return { count: 1 };
      },
      create: async ({ data }: { data: Omit<typeof resetTokens[number], "id" | "usedAt"> }) => {
        const created = { id: `reset-${resetTokens.length + 1}`, ...data, usedAt: null };
        resetTokens.push(created);
        return created;
      },
      findUnique: async ({ where }: { where: { tokenHash: string } }) =>
        resetTokens.find((token) => token.tokenHash === where.tokenHash) ?? null,
      updateMany: async ({ where, data }: {
        where: { id: string; usedAt: null; expiresAt: { gt: Date } };
        data: { usedAt: Date };
      }) => {
        const token = resetTokens.find((candidate) =>
          candidate.id === where.id && candidate.usedAt === null && candidate.expiresAt > where.expiresAt.gt,
        );
        if (!token) return { count: 0 };
        token.usedAt = data.usedAt;
        return { count: 1 };
      },
    },
    user: {
      update: async ({ data }: { data: { passwordHash: string; tokenVersion: { increment: number } } }) => {
        user.passwordHash = data.passwordHash;
        user.tokenVersion += data.tokenVersion.increment;
        return user;
      },
    },
    groupMember: {
      findMany: async () => [{ groupId: "group-id" }],
    },
    auditEvent: {
      create: async ({ data }: { data: { action: string; entityId: string } }) => {
        auditEvents.push(data);
        return data;
      },
    },
  };
  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email: string } }) =>
        where.email === user.email ? { id: user.id, name: user.name, email: user.email } : null,
    },
    passwordResetToken: {
      deleteMany: async ({ where }: { where: { tokenHash: string } }) => {
        const index = resetTokens.findIndex((token) => token.tokenHash === where.tokenHash);
        if (index >= 0) resetTokens.splice(index, 1);
        return { count: 1 };
      },
    },
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
  } as unknown as PrismaService;
  const jwt = { signAsync: async () => "signed-session" } as unknown as JwtService;
  const mail = {
    sendPasswordReset: async (email: { email: string; name: string; resetUrl: string }) => {
      sentEmails.push(email);
    },
  };
  return {
    auth: new AuthService(prisma, jwt, mail as never),
    user,
    resetTokens,
    auditEvents,
    sentEmails,
  };
}

describe("AuthService.acceptInvitation", () => {
  it("creates the invited account, membership, audit event, and session", async () => {
    const state = createInvitationService(new Date(Date.now() + 60_000));
    const result = await state.auth.acceptInvitation({
      token: state.token,
      password: "a-unique-strong-password",
    });

    assert.equal(result.token, "signed-session");
    assert.deepEqual(result.user, { id: "user-id", name: "Group member", email: "member@example.com", phone: "+254712345678", profilePhotoData: null });
    assert.equal(state.users.length, 1);
    assert.notEqual(state.users[0].passwordHash, "a-unique-strong-password");
    assert.equal(state.members[0].groupId, "group-id");
    assert.equal(state.members[0].role, "MEMBER");
    assert.equal(state.auditEvents[0].action, "MEMBER_INVITATION_ACCEPTED");
  });

  it("rejects expired invitations without creating an account", async () => {
    const state = createInvitationService(new Date(Date.now() - 60_000));

    await assert.rejects(
      state.auth.acceptInvitation({ token: state.token, password: "a-unique-strong-password" }),
      /invalid, expired, or already used/,
    );
    assert.equal(state.users.length, 0);
    assert.equal(state.members.length, 0);
  });

  it("allows a single acceptance and rejects reuse", async () => {
    const state = createInvitationService(new Date(Date.now() + 60_000));
    const input = { token: state.token, password: "a-unique-strong-password" };

    await state.auth.acceptInvitation(input);
    await assert.rejects(state.auth.acceptInvitation(input), /invalid, expired, or already used/);
    assert.equal(state.users.length, 1);
    assert.equal(state.members.length, 1);
  });

  it("adds an existing verified account to another group without creating a duplicate account", async () => {
    const password = "the-account-owners-password";
    const existingUser = {
      id: "existing-user",
      email: "member@example.com",
      name: "Existing account",
      passwordHash: await hash(password, 4),
      phone: null,
      profilePhotoData: null,
    };
    const state = createInvitationService(new Date(Date.now() + 60_000), existingUser);

    const result = await state.auth.acceptInvitation({ token: state.token, password });

    assert.equal(result.user.id, existingUser.id);
    assert.equal(state.users.length, 1);
    assert.equal(state.members.length, 1);
    assert.equal(state.members[0].userId, existingUser.id);
  });

  it("requires the existing account password before adding another group membership", async () => {
    const existingUser = {
      id: "existing-user",
      email: "member@example.com",
      name: "Existing account",
      passwordHash: await hash("the-account-owners-password", 4),
      phone: null,
      profilePhotoData: null,
    };
    const state = createInvitationService(new Date(Date.now() + 60_000), existingUser);

    await assert.rejects(
      state.auth.acceptInvitation({ token: state.token, password: "wrong-password" }),
      /Email or password is incorrect/,
    );
    assert.equal(state.members.length, 0);
    assert.equal(state.auditEvents.length, 0);
  });
});

describe("AuthService password reset", () => {
  it("sends a one-hour link only for known accounts and stores only its hash", async () => {
    const state = createResetService();
    const previousAppUrl = process.env.APP_URL;
    process.env.APP_URL = "http://localhost:3000";
    try {
      await state.auth.requestPasswordReset({ email: "MEMBER@example.com" });
      await state.auth.requestPasswordReset({ email: "unknown@example.com" });
    } finally {
      if (previousAppUrl === undefined) delete process.env.APP_URL;
      else process.env.APP_URL = previousAppUrl;
    }

    assert.equal(state.sentEmails.length, 1);
    assert.match(state.sentEmails[0].resetUrl, /^http:\/\/localhost:3000\/\?reset=[A-Za-z0-9_-]{43}$/);
    assert.equal(state.resetTokens.length, 1);
    assert.notEqual(state.resetTokens[0].tokenHash, new URL(state.sentEmails[0].resetUrl).searchParams.get("reset"));
    assert.equal(state.resetTokens[0].expiresAt.getTime() - Date.now() <= 60 * 60 * 1000, true);
  });

  it("changes the password once, increments the session version, and audits the reset", async () => {
    const state = createResetService();
    const previousAppUrl = process.env.APP_URL;
    process.env.APP_URL = "http://localhost:3000";
    try {
      await state.auth.requestPasswordReset({ email: "member@example.com" });
    } finally {
      if (previousAppUrl === undefined) delete process.env.APP_URL;
      else process.env.APP_URL = previousAppUrl;
    }
    const token = new URL(state.sentEmails[0].resetUrl).searchParams.get("reset")!;

    await state.auth.resetPassword({ token, password: "a-new-unique-password" });

    assert.notEqual(state.user.passwordHash, "old-password-hash");
    assert.equal(state.user.tokenVersion, 1);
    assert.equal(state.auditEvents[0].action, "PASSWORD_RESET");
    await assert.rejects(
      state.auth.resetPassword({ token, password: "another-new-password" }),
      /invalid, expired, or already used/,
    );
    assert.equal(state.user.tokenVersion, 1);
  });

  it("rejects expired links without changing the account", async () => {
    const state = createResetService();
    const previousAppUrl = process.env.APP_URL;
    process.env.APP_URL = "http://localhost:3000";
    try {
      await state.auth.requestPasswordReset({ email: "member@example.com" });
    } finally {
      if (previousAppUrl === undefined) delete process.env.APP_URL;
      else process.env.APP_URL = previousAppUrl;
    }
    const token = new URL(state.sentEmails[0].resetUrl).searchParams.get("reset")!;
    state.resetTokens[0].expiresAt = new Date(Date.now() - 1);

    await assert.rejects(
      state.auth.resetPassword({ token, password: "a-new-unique-password" }),
      /invalid, expired, or already used/,
    );
    assert.equal(state.user.passwordHash, "old-password-hash");
    assert.equal(state.user.tokenVersion, 0);
  });
});
