import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SessionGuard, SessionUser } from "./auth";
import { PrismaService } from "./prisma.service";

function createGuard(memberships: string[]) {
  const prisma = {
    user: { findUnique: async () => ({ tokenVersion: 0 }) },
    groupMember: {
      findFirst: async ({ where }: { where: { userId: string; groupId?: string } }) =>
        memberships.includes(where.groupId ?? memberships[0] ?? "")
          ? { groupId: where.groupId ?? memberships[0] }
          : null,
    },
  } as unknown as PrismaService;
  const jwt = { verify: () => ({ sub: "user-id", email: "member@example.com" }) } as unknown as JwtService;
  const guard = new SessionGuard(jwt, prisma);
  return { guard };
}

function context(workspace?: string) {
  const request = {
    method: "GET",
    cookies: { maliwise_session: "session" },
    get: (header: string) => header.toLowerCase() === "x-maliwise-workspace" ? workspace : undefined,
  } as unknown as { method: string; cookies: { maliwise_session: string }; get: (header: string) => string | undefined; user?: SessionUser };
  const executionContext = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
  return { executionContext, request };
}

describe("SessionGuard workspace isolation", () => {
  it("binds a request to a group the account belongs to", async () => {
    const { guard } = createGuard(["group-a", "group-b"]);
    const requestContext = context("group-b");

    await guard.canActivate(requestContext.executionContext);

    assert.equal(requestContext.request.user?.selectedGroupId, "group-b");
    assert.equal(requestContext.request.user?.personalWorkspace, false);
  });

  it("rejects a group workspace the account does not belong to", async () => {
    const { guard } = createGuard(["group-a"]);
    const requestContext = context("another-groups-id");

    await assert.rejects(guard.canActivate(requestContext.executionContext), ForbiddenException);
  });

  it("marks the personal workspace without assigning a group", async () => {
    const { guard } = createGuard(["group-a"]);
    const requestContext = context("personal");

    await guard.canActivate(requestContext.executionContext);

    assert.equal(requestContext.request.user?.selectedGroupId, null);
    assert.equal(requestContext.request.user?.personalWorkspace, true);
  });
});
