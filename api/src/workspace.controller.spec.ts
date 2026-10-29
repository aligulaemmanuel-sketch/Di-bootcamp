import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { WorkspaceController } from "./workspace.controller";
import { PrismaService } from "./prisma.service";
import { MailService } from "./mail.service";
import { SessionUser } from "./auth";

describe("personal finance data isolation", () => {
  it("scopes personal goals and activities to the signed-in user", async () => {
    const queries: { goals?: unknown; activities?: unknown } = {};
    const prisma = {
      personalGoal: {
        findMany: async (query: unknown) => { queries.goals = query; return []; },
      },
      personalActivity: {
        findMany: async (query: unknown) => { queries.activities = query; return []; },
      },
    } as unknown as PrismaService;
    const controller = new WorkspaceController(prisma, {} as MailService);

    await controller.getPersonalWorkspace({ sub: "alice", email: "alice@example.com", personalWorkspace: true });

    assert.deepEqual(queries.goals, {
      where: { userId: "alice" },
      orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
      include: { activities: { where: { userId: "alice" }, select: { amountMinor: true } } },
    });
    assert.deepEqual(queries.activities, {
      where: { userId: "alice" },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: 100,
      select: { id: true, title: true, kind: true, amountMinor: true, occurredAt: true, goal: { select: { id: true, title: true } } },
    });
  });

  describe("SACCO workspace isolation", () => {
    const user: SessionUser = {
      sub: "member-user",
      email: "member@example.com",
      selectedGroupId: "sacco-a",
      personalWorkspace: false,
    };

    it("limits a member's manual account history to their own SACCO membership", async () => {
      const queries: { entries?: unknown; totals?: unknown } = {};
      const prisma = {
        groupMember: {
          findFirst: async () => ({
            id: "member-a",
            role: "MEMBER",
            groupId: "sacco-a",
            group: { id: "sacco-a", type: "SACCO" },
          }),
        },
        saccoEntry: {
          findMany: async (query: unknown) => { queries.entries = query; return []; },
          groupBy: async (query: unknown) => { queries.totals = query; return []; },
        },
      } as unknown as PrismaService;
      const controller = new WorkspaceController(prisma, {} as MailService);

      await controller.listSacco