import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
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

    describe("member invitation tracking", () => {
      const manager: SessionUser = {
        sub: "manager-user",
        email: "manager@example.com",
        selectedGroupId: "chama-a",
        personalWorkspace: false,
      };

      it("returns only invitations for the selected group with derived status", async () => {
        const now = new Date();
        const invitations = [
          { id: "pending", name: "Pending User", email: "pending@example.com", phone: "+254700000001", role: "MEMBER", createdAt: now, expiresAt: new Date(now.getTime() + 60_000), acceptedAt: null, acceptedUserId: null },
          { id: "accepted", name: "Joined User", email: "joined@example.com", phone: "+254700000002", role: "TREASURER", createdAt: now, expiresAt: new Date(now.getTime() + 60_000), acceptedAt: now, acceptedUserId: "accepted-user" },
          { id: "review", name: "Review User", email: "review@example.com", phone: "+254700000005", role: "MEMBER", createdAt: now, expiresAt: new Date(now.getTime() + 60_000), acceptedAt: now, acceptedUserId: "review-user" },
          { id: "expired", name: "Expired User", email: "expired@example.com", phone: "+254700000003", role: "MEMBER", createdAt: now, expiresAt: new Date(now.getTime() - 60_000), acceptedAt: null, acceptedUserId: null },
        ];
        let query: unknown;
        const prisma = {
          groupMember: {
            findFirst: async () => ({
              id: "manager-membership",
              role: "OWNER",
              groupId: "chama-a",
              group: { id: "chama-a", type: "CHAMA" },
            }),
              findMany: async () => [
                { userId: "accepted-user", status: "APPROVED" },
                { userId: "review-user", status: "PENDING_APPROVAL" },
              ],
          },
          memberInvitation: {
            findMany: async (value: unknown) => { query = value; return invitations; },
          },
        } as unknown as PrismaService;
        const controller = new WorkspaceController(prisma, {} as MailService);

        const result = await controller.listInvitations(manager);

        assert.deepEqual(query, {
          where: { groupId: "chama-a" },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 100,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            expiresAt: true,
            acceptedAt: true,
            acceptedUserId: true,
          },
        });
        assert.deepEqual(result.map((invitation) => invitation.status), ["PENDING", "ACCEPTED", "REVIEW", "EXPIRED"]);
        assert.equal("tokenHash" in result[0], false);
      });

      it("returns pending requests only to authorized managers", async () => {
        const request = {
          id: "request-id",
          name: "New member",
          phone: "+254700000004",
          role: "MEMBER",
          joinedAt: new Date(),
          user: { email: "new@example.com" },
        };
        let query: unknown;
        const prisma = {
          groupMember: {
            findFirst: async () => ({
              id: "manager-membership",
              role: "OWNER",
              groupId: "chama-a",
              group: { id: "chama-a", type: "CHAMA" },
            }),
            findMany: async (value: unknown) => { query = value; return [request]; },
          },
        } as unknown as PrismaService;
        const controller = new WorkspaceController(prisma, {} as MailService);

        assert.deepEqual(await controller.listMembershipRequests(manager), [{
          id: "request-id",
          name: "New member",
          phone: "+254700000004",
          role: "MEMBER",
          joinedAt: request.joinedAt,
          email: "new@example.com",
        }]);
        assert.deepEqual(query, {
          where: { groupId: "chama-a", revokedAt: null, status: "PENDING_APPROVAL" },
          orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            joinedAt: true,
            user: { select: { email: true } },
          },
        });
      });

      it("records membership approvals and audit history", async () => {
        const updates: { status?: string }[] = [];
        const events: { action: string; entityId: string }[] = [];
        const tx = {
          groupMember: {
            updateMany: async ({ data }: { data: { status: string } }) => {
              updates.push(data);
              return { count: 1 };
            },
          },
          auditEvent: {
            create: async ({ data }: { data: typeof events[number] }) => {
              events.push(data);
            },
          },
        };
        let membershipLookup = 0;
        const prisma = {
          groupMember: {
            findMany: async () => [],
            findFirst: async () => ++membershipLookup === 1
              ? {
                id: "manager-membership",
                role: "OWNER",
                groupId: "chama-a",
                group: { id: "chama-a", type: "CHAMA" },
              }
              : { id: "pending-member", role: "MEMBER", groupId: "chama-a" },
          },
          $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
        } as unknown as PrismaService;
        const controller = new WorkspaceController(prisma, {} as MailService);

        assert.deepEqual(await controller.decideMembershipRequest(manager, "pending-member", { decision: "APPROVE" }), {
          success: true,
          status: "APPROVED",
        });
        assert.deepEqual(updates, [{ status: "APPROVED" }]);
        assert.deepEqual(events, [{
          groupId: "chama-a",
          actorId: "manager-user",
          action: "MEMBER_MEMBERSHIP_APPROVED",
          entityType: "GroupMember",
          entityId: "pending-member",
        }]);
      });

      it("does not allow regular members to view group invitations", async () => {
        let invitationsQueried = false;
        const prisma = {
          groupMember: {
            findFirst: async () => ({
              id: "member-membership",
              role: "MEMBER",
              groupId: "chama-a",
              group: { id: "chama-a", type: "CHAMA" },
            }),
          },
          memberInvitation: {
            findMany: async () => { invitationsQueried = true; return []; },
          },
        } as unknown as PrismaService;
        const controller = new WorkspaceController(prisma, {} as MailService);

        await assert.rejects(controller.listInvitations(manager), ForbiddenException);
        assert.equal(invitationsQueried, false);
      });
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

      await controller.listSaccoEntries(user);

      assert.deepEqual(queries.entries, {
        where: { groupId: "sacco-a", memberId: "member-a" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 200,
        select: {
          id: true,
          kind: true,
          accountType: true,
          amountMinor: true,
          reference: true,
          note: true,
          createdAt: true,
          member: { select: { id: true, name: true } },
        },
      });
      assert.deepEqual(queries.totals, {
        by: ["memberId", "accountType", "kind"],
        where: { groupId: "sacco-a", memberId: "member-a" },
        _sum: { amountMinor: true },
      });
    });

    it("rejects share capital entries assigned to FOSA", async () => {
      let writeAttempted = false;
      const prisma = {
        groupMember: {
          findFirst: async () => ({
            id: "treasurer-membership",
            role: "TREASURER",
            groupId: "sacco-a",
            group: { id: "sacco-a", type: "SACCO" },
          }),
        },
        saccoEntry: { create: async () => { writeAttempted = true; } },
      } as unknown as PrismaService;
      const controller = new WorkspaceController(prisma, {} as MailService);

      await assert.rejects(controller.recordSaccoEntry(user, {
        memberId: "member-a",
        kind: "SHARE_CAPITAL",
        accountType: "FOSA",
        amountKes: "100",
      }), BadRequestException);
      assert.equal(writeAttempted, false);
    });

    it("rejects loan products that belong to a different SACCO", async () => {
      let loanCreateAttempted = false;
      let productQuery: unknown;
      const prisma = {
        groupMember: {
          findFirst: async () => ({
            id: "member-a",
            role: "MEMBER",
            groupId: "sacco-a",
            group: { id: "sacco-a", type: "SACCO" },
          }),
        },
        saccoLoanProduct: {
          findFirst: async (query: unknown) => { productQuery = query; return null; },
        },
        loan: { create: async () => { loanCreateAttempted = true; } },
      } as unknown as PrismaService;
      const controller = new WorkspaceController(prisma, {} as MailService);

      await assert.rejects(controller.createLoan(user, {
        memberId: "member-a",
        productId: "e3af54af-f97c-4807-a3a6-d52a33f9d446",
        amountKes: "100",
        purpose: "School fees",
      }), BadRequestException);
      assert.deepEqual(productQuery, {
        where: { id: "e3af54af-f97c-4807-a3a6-d52a33f9d446", groupId: "sacco-a" },
        select: { id: true },
      });
      assert.equal(loanCreateAttempted, false);
    });

    it("does not expose SACCO entry endpoints to chama workspaces", async () => {
      const prisma = {
        groupMember: {
          findFirst: async () => ({
            id: "member-a",
            role: "MEMBER",
            groupId: "chama-a",
            group: { id: "chama-a", type: "CHAMA" },
          }),
        },
        saccoEntry: { findMany: async () => assert.fail("SACCO entries must not be queried for a chama") },
      } as unknown as PrismaService;
      const controller = new WorkspaceController(prisma, {} as MailService);

      await assert.rejects(controller.listSaccoEntries(user), BadRequestException);
    });
  });

  it("does not allow another account's personal goal to be attached to a record", async () => {
    let createCalled = false;
    let goalOwner: string | undefined;
    const prisma = {
      personalGoal: {
        findFirst: async ({ where }: { where: { userId: string } }) => {
          goalOwner = where.userId;
          return null;
        },
      },
      personalActivity: {
        create: async () => { createCalled = true; },
      },
    } as unknown as PrismaService;
    const controller = new WorkspaceController(prisma, {} as MailService);
    const user: SessionUser = { sub: "alice", email: "alice@example.com", personalWorkspace: true };

    await assert.rejects(controller.createPersonalActivity(user, {
      title: "Private record",
      kind: "SAVING",
      amountKes: "100",
      goalId: "e3af54af-f97c-4807-a3a6-d52a33f9d446",
    }), BadRequestException);
    assert.equal(goalOwner, "alice");
    assert.equal(createCalled, false);
  });
});
