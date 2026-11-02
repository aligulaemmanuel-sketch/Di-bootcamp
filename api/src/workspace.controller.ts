import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Headers,
  Inject,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { randomUUID } from "node:crypto";
import { CurrentUser, SessionGuard, SessionUser } from "./auth";
import { CreateContributionDto, CreateGroupDto, CreateInvitationDto, CreateLoanDto, CreateMemberDto, CreatePersonalActivityDto, CreatePersonalGoalDto, CreateReminderDto, CreateSaccoEntryDto, CreateSaccoLoanProductDto, CreateSavingsGoalDto, DecideLoanDto, DecideMembershipDto, UpdateProfileDto } from "./auth.dto";
import { PrismaService } from "./prisma.service";
import { GroupRole, Prisma } from "@prisma/client";
import { calculateGoalDiscipline } from "./savings-goals";
import { createInvitationToken } from "./invitation-token";
import { MailService } from "./mail.service";
import { validateProfilePhotoData } from "./profile-photo";

@Controller("api")
@UseGuards(SessionGuard)
export class WorkspaceController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MailService) private readonly mail: MailService,
  ) {}

  @Patch("profile")
  async updateProfile(@CurrentUser() user: SessionUser, @Body() input: UpdateProfileDto) {
    const name = input.name?.trim();
    if (name !== undefined && name.length < 2) {
      throw new BadRequestException("Your name must contain at least two characters.");
    }

    const profilePhotoData = validateProfilePhotoData(input.profilePhotoData);
    const phone = input.phone
      ? input.phone.startsWith("+") ? input.phone : input.phone.startsWith("0") ? `+254${input.phone.slice(1)}` : `+${input.phone}`
      : undefined;

    const memberships = await this.prisma.groupMember.findMany({
      where: { userId: user.sub, revokedAt: null, status: "APPROVED" },
      select: { groupId: true },
    });
    const updated = await this.prisma.$transaction(async (tx) => {
      const account = await tx.user.update({
        where: { id: user.sub },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(profilePhotoData !== undefined ? { profilePhotoData } : {}),
        },
        select: { id: true, name: true, email: true, phone: true, profilePhotoData: true },
      });
      if (name !== undefined) {
        await tx.groupMember.updateMany({ where: { userId: user.sub, revokedAt: null }, data: { name } });
      }
      for (const membership of memberships) {
        await tx.auditEvent.create({
          data: {
            groupId: membership.groupId,
            actorId: user.sub,
            action: "PROFILE_UPDATED",
            entityType: "User",
            entityId: user.sub,
          },
        });
      }
      return account;
    });
    return updated;
  }

  @Get("workspaces")
  async listWorkspaces(@CurrentUser() user: SessionUser) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId: user.sub, revokedAt: null, status: "APPROVED" },
      orderBy: { joinedAt: "asc" },
      select: { groupId: true, role: true, group: { select: { id: true, name: true, currency: true, type: true } } },
    });
    return memberships.map(({ group, role }) => ({ ...group, role }));
  }

  @Post("groups")
  async createGroup(@CurrentUser() user: SessionUser, @Body() input: CreateGroupDto) {
    if (input.constitutionSigned !== true) {
      throw new BadRequestException("A Chama or SACCO workspace must be signed by the designated officials before it can be created.");
    }
    const account = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { name: true },
    });
    if (!account) throw new NotFoundException("Account not found.");
    const phone = this.normalizePhone(input.phone);
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: input.name.trim(),
          type: input.type,
          members: {
            create: {
              userId: user.sub,
              name: account.name,
              phone,
              role: input.type === "SACCO" ? "CHAIRPERSON" : "OWNER",
            },
          },
        },
        include: { members: { select: { role: true }, where: { userId: user.sub } } },
      });
      await tx.auditEvent.create({
        data: {
          groupId: group.id,
          actorId: user.sub,
          action: input.type === "SACCO" ? "SACCO_CREATED" : "GROUP_CREATED",
          entityType: "Group",
          entityId: group.id,
        },
      });
      return { id: group.id, name: group.name, currency: group.currency, type: group.type, role: group.members[0].role };
    });
  }

  @Get("sacco/entries")
  async listSaccoEntries(@CurrentUser() user: SessionUser) {
    const { group, role, member } = await this.getMembership(user);
    this.requireSacco(group.type);
    const canViewAll = ["CHAIRPERSON", "OWNER", "ADMIN", "TREASURER", "SECRETARY"].includes(role);
    const where = { groupId: group.id, ...(!canViewAll ? { memberId: member.id } : {}) };
    const [entries, totals] = await Promise.all([
      this.prisma.saccoEntry.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 200,
        select: {
          id: true, kind: true, accountType: true, amountMinor: true, reference: true, note: true, createdAt: true,
          member: { select: { id: true, name: true } },
        },
      }),
      this.prisma.saccoEntry.groupBy({
        by: ["memberId", "accountType", "kind"],
        where,
        _sum: { amountMinor: true },
      }),
    ]);
    return {
      entries: entries.map((entry) => ({ ...entry, amountMinor: entry.amountMinor.toString() })),
      totals: totals.map((total) => ({ memberId: total.memberId, accountType: total.accountType, kind: total.kind, amountMinor: (total._sum.amountMinor ?? 0n).toString() })),
      isManager: canViewAll,
    };
  }

  @Post("sacco/entries")
  async recordSaccoEntry(
    @CurrentUser() user: SessionUser,
    @Body() input: CreateSaccoEntryDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    const { group, role } = await this.getMembership(user);
    this.requireSacco(group.type);
    this.requireRole(role, ["CHAIRPERSON", "TREASURER"]);
    if (input.kind === "SHARE_CAPITAL" && input.accountType !== "BOSA") {
      throw new BadRequestException("Share capital must be recorded under BOSA.");
    }
    if (!idempotencyKey || !isUUID(idempotencyKey)) {
      throw new BadRequestException("A valid Idempotency-Key header is required.");
    }
    const amountMinor = BigInt(input.amountKes) * 100n;
    const note = input.note?.trim() || null;
    const member = await this.prisma.groupMember.findFirst({
      where: { id: input.memberId, groupId: group.id },
      select: { id: true },
    });
    if (!member) throw new BadRequestException("Choose a member of this SACCO.");

    const existing = await this.prisma.saccoEntry.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.groupId !== group.id || existing.memberId !== member.id || existing.kind !== input.kind || existing.accountType !== input.accountType || existing.amountMinor !== amountMinor || existing.note !== note) {
        throw new ConflictException("This idempotency key was already used for a different SACCO entry.");
      }
      return { ...existing, amountMinor: existing.amountMinor.toString() };
    }

    const reference = `SAC-${randomUUID()}`;
    try {
      const entry = await this.prisma.$transaction(async (tx) => {
        const created = await tx.saccoEntry.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            recordedById: user.sub,
            kind: input.kind,
            accountType: input.accountType,
            amountMinor,
            reference,
            idempotencyKey,
            note,
          },
          select: { id: true, kind: true, amountMinor: true, reference: true, note: true, createdAt: true },
        });
        await tx.auditEvent.create({
          data: { groupId: group.id, actorId: user.sub, action: `SACCO_${input.kind}_RECORDED`, entityType: "SaccoEntry", entityId: created.id },
        });
        return created;
      });
      return { ...entry, amountMinor: entry.amountMinor.toString() };
    } catch (error) {
      if (this.isUniqueError(error)) {
        const concurrent = await this.prisma.saccoEntry.findUnique({ where: { idempotencyKey } });
        if (
          concurrent?.groupId === group.id && concurrent.memberId === member.id &&
          concurrent.kind === input.kind && concurrent.accountType === input.accountType &&
          concurrent.amountMinor === amountMinor && concurrent.note === note
        ) {
          return { ...concurrent, amountMinor: concurrent.amountMinor.toString() };
        }
        throw new ConflictException("This idempotency key has already been used.");
      }
      throw error;
    }
  }

  @Get("sacco/loan-products")
  async listSaccoLoanProducts(@CurrentUser() user: SessionUser) {
    const { group } = await this.getMembership(user);
    this.requireSacco(group.type);
    return this.prisma.saccoLoanProduct.findMany({
      where: { groupId: group.id },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
      select: { id: true, name: true, calculationMethod: true, annualInterestBps: true, termMonths: true, createdAt: true },
    });
  }

  @Post("sacco/loan-products")
  async createSaccoLoanProduct(@CurrentUser() user: SessionUser, @Body() input: CreateSaccoLoanProductDto) {
    const { group, role } = await this.getMembership(user);
    this.requireSacco(group.type);
    this.requireRole(role, ["CHAIRPERSON", "CREDIT_OFFICER"]);
    try {
      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.saccoLoanProduct.create({
          data: {
            groupId: group.id,
            name: input.name.trim(),
            calculationMethod: input.calculationMethod,
            annualInterestBps: Number(input.annualInterestBps),
            termMonths: Number(input.termMonths),
            createdById: user.sub,
          },
          select: { id: true, name: true, calculationMethod: true, annualInterestBps: true, termMonths: true, createdAt: true },
        });
        await tx.auditEvent.create({
          data: { groupId: group.id, actorId: user.sub, action: "SACCO_LOAN_PRODUCT_CREATED", entityType: "SaccoLoanProduct", entityId: created.id },
        });
        return created;
      });
      return product;
    } catch (error) {
      if (this.isUniqueError(error)) throw new ConflictException("A loan product with that name already exists.");
      throw error;
    }
  }

  @Get("personal")
  async getPersonalWorkspace(@CurrentUser() user: SessionUser) {
    const [goals, activities] = await Promise.all([
      this.prisma.personalGoal.findMany({
        where: { userId: user.sub },
        orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
        include: { activities: { where: { userId: user.sub }, select: { amountMinor: true } } },
      }),
      this.prisma.personalActivity.findMany({
        where: { userId: user.sub },
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
        take: 100,
        select: { id: true, title: true, kind: true, amountMinor: true, occurredAt: true, goal: { select: { id: true, title: true } } },
      }),
    ]);
    return {
      goals: goals.map(({ activities: goalActivities, ...goal }) => {
        const savedMinor = goalActivities.reduce((sum, item) => sum + item.amountMinor, 0n);
        return {
          ...goal,
          targetMinor: goal.targetMinor.toString(),
          savedMinor: savedMinor.toString(),
          progressPercent: Math.min(100, Number((savedMinor * 100n) / goal.targetMinor)),
        };
      }),
      activities: activities.map((item) => ({ ...item, amountMinor: item.amountMinor.toString() })),
    };
  }

  @Post("personal/goals")
  async createPersonalGoal(@CurrentUser() user: SessionUser, @Body() input: CreatePersonalGoalDto) {
    const targetDate = new Date(input.targetDate);
    if (!Number.isFinite(targetDate.getTime()) || targetDate <= new Date()) {
      throw new BadRequestException("Choose a target date in the future.");
    }
    return this.prisma.personalGoal.create({
      data: {
        userId: user.sub,
        title: input.title.trim(),
        kind: input.kind,
        targetMinor: BigInt(input.targetKes) * 100n,
        targetDate,
      },
    }).then((goal) => ({ ...goal, targetMinor: goal.targetMinor.toString(), savedMinor: "0", progressPercent: 0 }));
  }

  @Post("personal/activities")
  async createPersonalActivity(@CurrentUser() user: SessionUser, @Body() input: CreatePersonalActivityDto) {
    const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
    if (!Number.isFinite(occurredAt.getTime()) || occurredAt > new Date(Date.now() + 60_000)) {
      throw new BadRequestException("Choose a valid activity date.");
    }
    if (input.goalId) {
      const goal = await this.prisma.personalGoal.findFirst({
        where: { id: input.goalId, userId: user.sub, kind: input.kind },
        select: { id: true },
      });
      if (!goal) throw new BadRequestException("Choose one of your personal goals with the same activity type.");
    }
    return this.prisma.personalActivity.create({
      data: {
        userId: user.sub,
        goalId: input.goalId,
        title: input.title.trim(),
        kind: input.kind,
        amountMinor: BigInt(input.amountKes) * 100n,
        occurredAt,
      },
    }).then((activity) => ({ ...activity, amountMinor: activity.amountMinor.toString() }));
  }

  @Get("reminders")
  async listReminders(@CurrentUser() user: SessionUser) {
    const reminders = await this.prisma.reminder.findMany({
      where: user.personalWorkspace || !user.selectedGroupId
        ? { creatorId: user.sub, groupId: null }
        : { OR: [{ creatorId: user.sub, groupId: null }, { groupId: user.selectedGroupId }] },
      orderBy: { dueAt: "asc" },
      take: 100,
    });
    return reminders;
  }

  @Post("reminders")
  async createReminder(@CurrentUser() user: SessionUser, @Body() input: CreateReminderDto) {
    const dueAt = new Date(input.dueAt);
    if (!Number.isFinite(dueAt.getTime()) || dueAt <= new Date()) {
      throw new BadRequestException("Choose a reminder time in the future.");
    }
    let groupId: string | null = null;
    if (input.sharedWithGroup) {
      if (user.personalWorkspace || !user.selectedGroupId) {
        throw new BadRequestException("Select a group workspace before sharing this reminder.");
      }
      const { group, role } = await this.getMembership(user);
      this.requireRole(role, ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON", "SECRETARY"]);
      groupId = group.id;
    }
    return this.prisma.reminder.create({
      data: {
        creatorId: user.sub,
        groupId,
        title: input.title.trim(),
        message: input.message.trim() || input.title.trim(),
        dueAt,
        emailEnabled: input.emailEnabled,
        smsEnabled: input.smsEnabled,
      },
    });
  }

  @Get("notifications")
  async listNotifications(@CurrentUser() user: SessionUser) {
    return this.prisma.userNotification.findMany({
      where: {
        userId: user.sub,
        reminder: user.personalWorkspace || !user.selectedGroupId
          ? { is: { groupId: null } }
          : { is: { OR: [{ groupId: null }, { groupId: user.selectedGroupId }] } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  @Patch("notifications/:id/read")
  async markNotificationRead(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    const changed = await this.prisma.userNotification.updateMany({
      where: { id, userId: user.sub, readAt: null },
      data: { readAt: new Date() },
    });
    if (!changed.count) {
      const notification = await this.prisma.userNotification.findFirst({ where: { id, userId: user.sub }, select: { id: true } });
      if (!notification) throw new NotFoundException("Notification not found.");
    }
    return { ok: true };
  }

  @Get("workspace")
  async getWorkspace(@CurrentUser() user: SessionUser) {
    const { group, role, member } = await this.getMembership(user);
    const [members, contributions, loans, contributionTotal, contributionCount, pendingLoans] = await Promise.all([
      this.prisma.groupMember.findMany({
        where: { groupId: group.id, revokedAt: null, status: "APPROVED" },
        orderBy: [{ joinedAt: "asc" }],
        select: { id: true, name: true, phone: true, role: true, joinedAt: true },
      }),
      this.prisma.contribution.findMany({
        where: { groupId: group.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          reference: true,
          amountMinor: true,
          method: true,
          note: true,
          createdAt: true,
          member: { select: { id: true, name: true } },
          savingsGoal: { select: { id: true, title: true } },
        },
      }),
      this.prisma.loan.findMany({
        where: { groupId: group.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          amountMinor: true,
          purpose: true,
          status: true,
          createdAt: true,
          member: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, calculationMethod: true, annualInterestBps: true, termMonths: true } },
        },
      }),
      this.prisma.contribution.aggregate({ where: { groupId: group.id }, _sum: { amountMinor: true } }),
      this.prisma.contribution.count({ where: { groupId: group.id } }),
      this.prisma.loan.count({ where: { groupId: group.id, status: "PENDING" } }),
    ]);
    return {
      group: { id: group.id, name: group.name, currency: group.currency, type: group.type },
      members,
      contributions: contributions.map((item) => ({ ...item, amountMinor: item.amountMinor.toString() })),
      loans: loans.map((item) => ({ ...item, amountMinor: item.amountMinor.toString() })),
      summary: {
        memberCount: members.length,
        contributionCount,
        contributionTotalMinor: (contributionTotal._sum.amountMinor ?? 0n).toString(),
        pendingLoans,
      },
      currentMemberId: member.id,
      canManageGoals: ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON"].includes(role),
      canManageMembers: group.type === "SACCO"
        ? ["CHAIRPERSON", "SECRETARY"].includes(role)
        : ["OWNER", "ADMIN", "TREASURER"].includes(role),
      canRecordSaccoEntries: group.type === "SACCO" && ["CHAIRPERSON", "TREASURER"].includes(role),
      canDecideLoans: ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON", "CREDIT_OFFICER"].includes(role),
      isAdmin: ["OWNER", "ADMIN", "CHAIRPERSON"].includes(role),
      isOwner: role === "OWNER" || role === "CHAIRPERSON",
    };
  }

  @Get("analytics")
  async getAnalytics(@CurrentUser() user: SessionUser, @Query("range") range = "30d") {
    const ranges = {
      "7d": { days: 7, bucket: "day" },
      "30d": { days: 30, bucket: "day" },
      "90d": { days: 90, bucket: "week" },
      "12m": { days: 0, bucket: "month" },
    } as const;
    if (!Object.hasOwn(ranges, range)) throw new BadRequestException("Choose a supported analytics date range.");
    const selectedRange = ranges[range as keyof typeof ranges];
    const now = new Date();
    const start = selectedRange.bucket === "month"
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - selectedRange.days + 1));
    const { group } = await this.getMembership(user);
    const [trendRows, contributionMethods, contributionsByMember, loansByMember, loanStatuses, members] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        period: Date;
        contributionMinor: bigint;
        contributionCount: bigint;
        loanMinor: bigint;
        loanCount: bigint;
      }>>(Prisma.sql`
        WITH contribution_periods AS (
          SELECT date_trunc(${selectedRange.bucket}, "createdAt" AT TIME ZONE 'UTC') AS period,
            SUM("amountMinor")::bigint AS amount, COUNT(*) AS count
          FROM "Contribution"
          WHERE "groupId" = ${group.id} AND "createdAt" >= ${start}
          GROUP BY 1
        ), loan_periods AS (
          SELECT date_trunc(${selectedRange.bucket}, "createdAt" AT TIME ZONE 'UTC') AS period,
            SUM("amountMinor")::bigint AS amount, COUNT(*) AS count
          FROM "Loan"
          WHERE "groupId" = ${group.id} AND "createdAt" >= ${start}
          GROUP BY 1
        )
        SELECT COALESCE(c.period, l.period) AS period,
          COALESCE(c.amount, 0)::bigint AS "contributionMinor",
          COALESCE(c.count, 0)::bigint AS "contributionCount",
          COALESCE(l.amount, 0)::bigint AS "loanMinor",
          COALESCE(l.count, 0)::bigint AS "loanCount"
        FROM contribution_periods c
        FULL OUTER JOIN loan_periods l ON c.period = l.period
        ORDER BY period
      `),
      this.prisma.contribution.groupBy({
        by: ["method"],
        where: { groupId: group.id, createdAt: { gte: start } },
        _sum: { amountMinor: true },
        _count: { _all: true },
      }),
      this.prisma.contribution.groupBy({
        by: ["memberId"],
        where: { groupId: group.id, createdAt: { gte: start } },
        _sum: { amountMinor: true },
      }),
      this.prisma.loan.groupBy({
        by: ["memberId"],
        where: { groupId: group.id, createdAt: { gte: start } },
        _sum: { amountMinor: true },
      }),
      this.prisma.loan.groupBy({
        by: ["status"],
        where: { groupId: group.id, createdAt: { gte: start } },
        _count: { _all: true },
      }),
      this.prisma.groupMember.findMany({
        where: { groupId: group.id, revokedAt: null, status: "APPROVED" },
        select: { id: true, name: true },
      }),
    ]);

    const bucketDates: Date[] = [];
    const cursor = new Date(start);
    if (selectedRange.bucket === "week") {
      cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7));
    }
    while (cursor <= now) {
      bucketDates.push(new Date(cursor));
      if (selectedRange.bucket === "month") cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + (selectedRange.bucket === "week" ? 7 : 1));
    }
    const periodKey = (date: Date) => selectedRange.bucket === "month"
      ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
      : selectedRange.bucket === "day"
        ? date.toISOString().slice(0, 10)
        : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - ((date.getUTCDay() + 6) % 7)))
          .toISOString().slice(0, 10);
    const actualByPeriod = new Map(trendRows.map((row) => [periodKey(row.period), row]));
    const memberTotals = new Map<string, { contributions: bigint; loans: bigint }>();
    for (const row of contributionsByMember) {
      memberTotals.set(row.memberId, { contributions: row._sum.amountMinor ?? 0n, loans: 0n });
    }
    for (const row of loansByMember) {
      const current = memberTotals.get(row.memberId) ?? { contributions: 0n, loans: 0n };
      current.loans = row._sum.amountMinor ?? 0n;
      memberTotals.set(row.memberId, current);
    }
    const loansTotal = loanStatuses.reduce((total, row) => total + row._count._all, 0);

    return {
      range,
      trend: bucketDates.map((date) => {
        const row = actualByPeriod.get(periodKey(date));
        return {
          date: date.toISOString(),
          contributionMinor: (row?.contributionMinor ?? 0n).toString(),
          contributionCount: Number(row?.contributionCount ?? 0n),
          loanMinor: (row?.loanMinor ?? 0n).toString(),
          loanCount: Number(row?.loanCount ?? 0n),
        };
      }),
      methods: contributionMethods.map((row) => ({
        method: row.method,
        amountMinor: (row._sum.amountMinor ?? 0n).toString(),
        count: row._count._all,
      })),
      members: members.map((member) => {
        const totals = memberTotals.get(member.id);
        return {
          memberId: member.id,
          name: member.name,
          contributionMinor: (totals?.contributions ?? 0n).toString(),
          loanMinor: (totals?.loans ?? 0n).toString(),
        };
      }).filter((member) => member.contributionMinor !== "0" || member.loanMinor !== "0")
        .sort((left, right) => {
          const leftTotal = BigInt(left.contributionMinor) + BigInt(left.loanMinor);
          const rightTotal = BigInt(right.contributionMinor) + BigInt(right.loanMinor);
          return leftTotal > rightTotal ? -1 : leftTotal < rightTotal ? 1 : 0;
        })
        .slice(0, 8),
      totals: {
        contributionMinor: contributionsByMember.reduce((total, row) => total + (row._sum.amountMinor ?? 0n), 0n).toString(),
        contributionCount: contributionMethods.reduce((total, row) => total + row._count._all, 0),
        loanMinor: loansByMember.reduce((total, row) => total + (row._sum.amountMinor ?? 0n), 0n).toString(),
        loanCount: loansTotal,
        activeMembers: contributionsByMember.length,
        memberCount: members.length,
        resolvedLoans: loanStatuses.filter((row) => row.status !== "PENDING").reduce((total, row) => total + row._count._all, 0),
      },
    };
  }

  @Get("goals")
  async listSavingsGoals(@CurrentUser() user: SessionUser) {
    const { group, role, member } = await this.getMembership(user);
    const goals = await this.prisma.savingsGoal.findMany({
      where: {
        groupId: group.id,
        ...(["OWNER", "ADMIN", "TREASURER"].includes(role) ? {} : { OR: [{ memberId: null }, { memberId: member.id }] }),
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      include: { member: { select: { id: true, name: true } } },
    });
    const totals = goals.length > 0 ? await this.prisma.contribution.groupBy({
      by: ["savingsGoalId"],
      where: { groupId: group.id, savingsGoalId: { in: goals.map((goal) => goal.id) } },
      _sum: { amountMinor: true },
    }) : [];
    const savedByGoal = new Map(totals.map((total) => [total.savingsGoalId, total._sum.amountMinor ?? 0n]));
    const now = new Date();
    return goals.map((goal) => {
      const savedMinor = savedByGoal.get(goal.id) ?? 0n;
      const progressPercent = Math.min(100, Number((savedMinor * 100n) / goal.targetMinor));
      return {
        ...goal,
        targetMinor: goal.targetMinor.toString(),
        savedMinor: savedMinor.toString(),
        progressPercent,
        ...calculateGoalDiscipline(goal.targetMinor, savedMinor, goal.startsAt, goal.deadline, now),
      };
    });
  }

  @Post("goals")
  async createSavingsGoal(@CurrentUser() user: SessionUser, @Body() input: CreateSavingsGoalDto) {
    const { group, role, member } = await this.getMembership(user);
    if (!["OWNER", "ADMIN", "TREASURER"].includes(role) && input.memberId !== member.id) {
      throw new ForbiddenException("You do not have permission to create this savings goal.");
    }
    const startsAt = this.parseDateOnly(input.startsAt);
    const deadline = this.parseDateOnly(input.deadline);
    if (!startsAt || !deadline || deadline < startsAt) {
      throw new BadRequestException("The deadline must be on or after the start date.");
    }
    const title = input.title.trim();
    if (title.length < 2) throw new BadRequestException("The goal name must contain at least two characters.");
    if (input.memberId && !(await this.prisma.groupMember.findFirst({ where: { id: input.memberId, groupId: group.id, revokedAt: null, status: "APPROVED" }, select: { id: true } }))) {
      throw new BadRequestException("Choose a member of your group.");
    }
    const goal = await this.prisma.$transaction(async (tx) => {
      const created = await tx.savingsGoal.create({
        data: {
          groupId: group.id,
          memberId: input.memberId ?? null,
          title,
          targetMinor: BigInt(input.targetKes) * 100n,
          startsAt,
          deadline,
        },
        include: { member: { select: { id: true, name: true } } },
      });
      await tx.auditEvent.create({
        data: { groupId: group.id, actorId: user.sub, action: "SAVINGS_GOAL_CREATED", entityType: "SavingsGoal", entityId: created.id },
      });
      return created;
    });
    return {
      ...goal,
      targetMinor: goal.targetMinor.toString(),
      savedMinor: "0",
      progressPercent: 0,
      ...calculateGoalDiscipline(goal.targetMinor, 0n, goal.startsAt, goal.deadline, new Date()),
    };
  }

  @Delete("goals/:id")
  async deleteSavingsGoal(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    const { group, role, member } = await this.getMembership(user);
    const goal = await this.prisma.savingsGoal.findFirst({ where: { id, groupId: group.id } });
    if (!goal) throw new NotFoundException("Savings goal not found.");
    if (!["OWNER", "ADMIN", "TREASURER"].includes(role) && goal.memberId !== member.id) {
      throw new ForbiddenException("You do not have permission to delete this savings goal.");
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.savingsGoal.delete({ where: { id: goal.id } });
      await tx.auditEvent.create({
        data: { groupId: group.id, actorId: user.sub, action: "SAVINGS_GOAL_DELETED", entityType: "SavingsGoal", entityId: goal.id },
      });
    });
    return { success: true };
  }

  @Get("members")
  async listMembers(@CurrentUser() user: SessionUser) {
    const { group } = await this.getMembership(user);
    return this.prisma.groupMember.findMany({
      where: { groupId: group.id, revokedAt: null, status: "APPROVED" },
      orderBy: { joinedAt: "desc" },
      select: { id: true, name: true, phone: true, role: true, joinedAt: true },
    });
  }

  @Get("membership-requests")
  async listMembershipRequests(@CurrentUser() user: SessionUser) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"]);
    return this.prisma.groupMember.findMany({
      where: { groupId: group.id, revokedAt: null, status: "PENDING_APPROVAL" },
      orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        joinedAt: true,
        user: { select: { email: true } },
      },
    }).then((requests) => requests.map(({ user: memberUser, ...request }) => ({
      ...request,
      email: memberUser?.email ?? null,
    })));
  }

  @Patch("membership-requests/:id")
  async decideMembershipRequest(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() input: DecideMembershipDto,
  ) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"]);
    const membership = await this.prisma.groupMember.findFirst({
      where: { id, groupId: group.id, revokedAt: null, status: "PENDING_APPROVAL" },
      select: { id: true },
    });
    if (!membership) throw new NotFoundException("Pending membership request not found.");

    const status = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";
    await this.prisma.$transaction(async (tx) => {
      const decided = await tx.groupMember.updateMany({
        where: { id: membership.id, groupId: group.id, revokedAt: null, status: "PENDING_APPROVAL" },
        data: {
          status,
          ...(input.decision === "REJECT" ? { revokedAt: new Date() } : {}),
        },
      });
      if (decided.count !== 1) throw new ConflictException("This membership request has already been reviewed.");
      await tx.auditEvent.create({
        data: {
          groupId: group.id,
          actorId: user.sub,
          action: input.decision === "APPROVE" ? "MEMBER_MEMBERSHIP_APPROVED" : "MEMBER_MEMBERSHIP_REJECTED",
          entityType: "GroupMember",
          entityId: membership.id,
        },
      });
    });
    return { success: true, status };
  }

  @Get("invitations")
  async listInvitations(@CurrentUser() user: SessionUser) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"]);

    const invitations = await this.prisma.memberInvitation.findMany({
      where: { groupId: group.id },
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
    const acceptedUserIds = invitations.flatMap((invitation) => invitation.acceptedUserId ? [invitation.acceptedUserId] : []);
    const memberships = acceptedUserIds.length
      ? await this.prisma.groupMember.findMany({
        where: { groupId: group.id, userId: { in: acceptedUserIds } },
        select: { userId: true, status: true },
      })
      : [];
    const membershipByUser = new Map(memberships.map((membership) => [membership.userId, membership.status]));
    const now = new Date();
    return invitations.map(({ acceptedUserId, ...invitation }) => {
      const membershipStatus = acceptedUserId ? membershipByUser.get(acceptedUserId) : undefined;
      return {
        ...invitation,
        status: membershipStatus === "APPROVED"
          ? "ACCEPTED"
          : membershipStatus === "PENDING_APPROVAL"
            ? "REVIEW"
            : membershipStatus === "REJECTED"
              ? "REJECTED"
              : invitation.expiresAt <= now && !invitation.acceptedAt
                ? "EXPIRED"
                : invitation.acceptedAt
                  ? "REJECTED"
                  : "PENDING",
      };
    });
  }

  @Delete("members/:id")
  async revokeMember(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    const { group, role, member: actor } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"]);
    if (id === actor.id) throw new BadRequestException("You cannot remove your own membership.");

    const target = await this.prisma.groupMember.findFirst({
      where: { id, groupId: group.id, revokedAt: null, status: "APPROVED" },
      select: { id: true, userId: true, role: true },
    });
    if (!target) throw new NotFoundException("Active group member not found.");

    const managerRoles: GroupRole[] = group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"];
    if (managerRoles.includes(target.role)) {
      const activeManagers = await this.prisma.groupMember.count({
        where: { groupId: group.id, revokedAt: null, status: "APPROVED", role: { in: managerRoles } },
      });
      if (activeManagers <= 1) {
        throw new ConflictException("The last member who can manage this workspace cannot be removed.");
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.groupMember.updateMany({
        where: { id: target.id, groupId: group.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) throw new ConflictException("This membership has already been revoked.");
      await tx.auditEvent.create({
        data: {
          groupId: group.id,
          actorId: user.sub,
          action: "MEMBER_ACCESS_REVOKED",
          entityType: "GroupMember",
          entityId: target.id,
        },
      });
    });
    return { success: true };
  }

  @Post("members")
  async addMember(@CurrentUser() user: SessionUser, @Body() input: CreateMemberDto) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO" ? ["CHAIRPERSON", "SECRETARY"] : ["OWNER", "ADMIN", "TREASURER"]);
    this.requireAssignableRole(group.type, input.role);
    const phone = this.normalizePhone(input.phone);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const member = await tx.groupMember.create({
          data: { groupId: group.id, name: input.name.trim(), phone, role: input.role },
          select: { id: true, name: true, phone: true, role: true, joinedAt: true },
        });
        await tx.auditEvent.create({
          data: { groupId: group.id, actorId: user.sub, action: "MEMBER_ADDED", entityType: "GroupMember", entityId: member.id },
        });
        return member;
      });
    } catch (error) {
      if (this.isUniqueError(error)) throw new ConflictException("That phone number is already in this group.");
      throw error;
    }
  }

  @Post("invitations")
  async inviteMember(@CurrentUser() user: SessionUser, @Body() input: CreateInvitationDto) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO" ? ["CHAIRPERSON", "SECRETARY"] : ["OWNER", "ADMIN", "TREASURER"]);
    this.requireAssignableRole(group.type, input.role);
    const email = input.email.trim().toLowerCase();
    const phone = this.normalizePhone(input.phone);
    const existingMember = await this.prisma.groupMember.findFirst({
      where: { groupId: group.id, phone, revokedAt: null },
      select: { id: true },
    });
    if (existingMember) throw new ConflictException("That phone number is already in this group.");

    const now = new Date();
    const existingInvitation = await this.prisma.memberInvitation.findFirst({
      where: { groupId: group.id, email, acceptedAt: null, expiresAt: { gt: now } },
      select: { id: true },
    });
    if (existingInvitation) throw new ConflictException("An active invitation has already been sent to that email.");

    const { token, tokenHash } = createInvitationToken();
    const invitation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.memberInvitation.create({
        data: {
          groupId: group.id,
          invitedById: user.sub,
          email,
          name: input.name.trim(),
          phone,
          role: input.role,
          tokenHash,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      await tx.auditEvent.create({
        data: {
          groupId: group.id,
          actorId: user.sub,
          action: "MEMBER_INVITATION_SENT",
          entityType: "MemberInvitation",
          entityId: created.id,
        },
      });
      return created;
    });
    const appUrl = (process.env.APP_URL ?? process.env.WEB_ORIGIN ?? "http://localhost:3000").replace(/\/+$/, "");
    try {
      await this.mail.sendMemberInvitation({
        email,
        name: invitation.name,
        groupName: group.name,
        invitationUrl: `${appUrl}/?invite=${encodeURIComponent(token)}`,
      });
    } catch (error) {
      await this.prisma.$transaction(async (tx) => {
        await tx.auditEvent.deleteMany({
          where: {
            groupId: group.id,
            actorId: user.sub,
            action: "MEMBER_INVITATION_SENT",
            entityType: "MemberInvitation",
            entityId: invitation.id,
          },
        });
        await tx.memberInvitation.delete({ where: { id: invitation.id } });
      });
      throw error;
    }

    return { success: true, email };
  }

  @Delete("invitations/:id")
  async revokeInvitation(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    const { group, role } = await this.getMembership(user);
    this.requireRole(role, group.type === "SACCO"
      ? ["CHAIRPERSON", "SECRETARY"]
      : ["OWNER", "ADMIN", "TREASURER"]);
    const invitation = await this.prisma.memberInvitation.findFirst({
      where: { id, groupId: group.id },
      select: { id: true, acceptedAt: true, revokedAt: true, expiresAt: true },
    });
    if (!invitation) throw new NotFoundException("Invitation not found.");
    if (invitation.acceptedAt) throw new ConflictException("An accepted invitation cannot be revoked. Remove the member's access instead.");
    if (invitation.revokedAt) return { success: true };
    if (invitation.expiresAt <= new Date()) throw new ConflictException("This invitation has expired.");

    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.memberInvitation.updateMany({
        where: { id: invitation.id, groupId: group.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) throw new ConflictException("This invitation is no longer pending.");
      await tx.auditEvent.create({
        data: {
          groupId: group.id,
          actorId: user.sub,
          action: "MEMBER_INVITATION_REVOKED",
          entityType: "MemberInvitation",
          entityId: invitation.id,
        },
      });
    });
    return { success: true };
  }

  @Get("contributions")
  async listContributions(@CurrentUser() user: SessionUser) {
    const { group } = await this.getMembership(user);
    if (group.type === "SACCO") throw new BadRequestException("SACCO financial records are available in Share capital & deposits.");
    const items = await this.prisma.contribution.findMany({
      where: { groupId: group.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, reference: true, amountMinor: true, method: true, note: true, createdAt: true,
        member: { select: { id: true, name: true } },
        savingsGoal: { select: { id: true, title: true } },
      },
    });
    return items.map((item) => ({ ...item, amountMinor: item.amountMinor.toString() }));
  }

  @Post("contributions")
  async recordContribution(
    @CurrentUser() user: SessionUser,
    @Body() input: CreateContributionDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    const { group, role } = await this.getMembership(user);
    if (group.type === "SACCO") throw new BadRequestException("Use manual SACCO entries for share capital and deposits.");
    this.requireRole(role, ["OWNER", "ADMIN", "TREASURER"]);
    if (!idempotencyKey || !isUUID(idempotencyKey)) {
      throw new BadRequestException("A valid Idempotency-Key header is required.");
    }
    const amountKes = BigInt(input.amountKes);
    const amountMinor = amountKes * 100n;
    const note = input.note.trim() || null;
    const member = await this.prisma.groupMember.findFirst({
      where: { id: input.memberId, groupId: group.id, revokedAt: null, status: "APPROVED" },
      select: { id: true },
    });
    if (!member) throw new BadRequestException("Choose a member of your group.");
    const savingsGoal = input.savingsGoalId
      ? await this.prisma.savingsGoal.findFirst({ where: { id: input.savingsGoalId, groupId: group.id } })
      : null;
    if (input.savingsGoalId && !savingsGoal) throw new BadRequestException("Choose a savings goal in your group.");
    if (savingsGoal?.memberId && savingsGoal.memberId !== member.id) {
      throw new BadRequestException("This savings goal belongs to a different member.");
    }
    if (savingsGoal) {
      const deadlineEnd = new Date(savingsGoal.deadline);
      deadlineEnd.setUTCDate(deadlineEnd.getUTCDate() + 1);
      const now = new Date();
      if (now < savingsGoal.startsAt || now >= deadlineEnd) {
        throw new BadRequestException("Choose a savings goal that is within its date range.");
      }
    }
    const previous = await this.prisma.contribution.findUnique({
      where: { idempotencyKey },
      select: {
        id: true, groupId: true, memberId: true, savingsGoalId: true, amountMinor: true, method: true, note: true,
        reference: true, createdAt: true, member: { select: { id: true, name: true } },
      },
    });
    if (previous) {
      if (
        previous.groupId !== group.id ||
        previous.memberId !== member.id ||
        previous.savingsGoalId !== (savingsGoal?.id ?? null) ||
        previous.amountMinor !== amountMinor ||
        previous.method !== input.method ||
        previous.note !== note
      ) {
        throw new ConflictException("This idempotency key was already used for a different contribution.");
      }
      return { ...previous, amountMinor: previous.amountMinor.toString() };
    }
    const reference = `MAN-${randomUUID()}`;
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const contribution = await tx.contribution.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            savingsGoalId: savingsGoal?.id ?? null,
            recordedById: user.sub,
            amountMinor,
            method: input.method,
            reference,
            idempotencyKey,
            note,
          },
          select: { id: true, reference: true, amountMinor: true, method: true, note: true, savingsGoalId: true, createdAt: true, member: { select: { id: true, name: true } } },
        });
        const transaction = await tx.ledgerTransaction.create({
          data: {
            groupId: group.id,
            reference,
            description: `Manual contribution recorded for ${input.method}`,
            currency: group.currency,
            amountMinor,
            entries: {
              create: [
                { account: "GROUP_CASH", side: "DEBIT", amountMinor },
                { account: "MEMBER_CONTRIBUTIONS", side: "CREDIT", amountMinor },
              ],
            },
          },
        });
        await tx.auditEvent.create({
          data: { groupId: group.id, actorId: user.sub, action: "CONTRIBUTION_RECORDED", entityType: "Contribution", entityId: contribution.id },
        });
        return { ...contribution, ledgerTransactionId: transaction.id };
      });
      return { ...result, amountMinor: result.amountMinor.toString() };
    } catch (error) {
      if (this.isUniqueError(error)) {
        const concurrent = await this.prisma.contribution.findUnique({ where: { idempotencyKey } });
        if (
          concurrent?.groupId === group.id &&
          concurrent.memberId === member.id &&
          concurrent.savingsGoalId === (savingsGoal?.id ?? null) &&
          concurrent.amountMinor === amountMinor &&
          concurrent.method === input.method &&
          concurrent.note === note
        ) {
          return { ...concurrent, amountMinor: concurrent.amountMinor.toString() };
        }
        throw new ConflictException("This idempotency key has already been used.");
      }
      throw error;
    }
  }

  @Get("loans")
  async listLoans(@CurrentUser() user: SessionUser) {
    const { group } = await this.getMembership(user);
    const items = await this.prisma.loan.findMany({
      where: { groupId: group.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, amountMinor: true, purpose: true, status: true, createdAt: true, decidedAt: true,
        member: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, calculationMethod: true, annualInterestBps: true, termMonths: true } },
      },
    });
    return items.map((item) => ({ ...item, amountMinor: item.amountMinor.toString() }));
  }

  @Post("loans")
  async createLoan(@CurrentUser() user: SessionUser, @Body() input: CreateLoanDto) {
    const { group, role, member: ownMembership } = await this.getMembership(user);
    if (group.type === "SACCO" && !input.productId) {
      throw new BadRequestException("Select a SACCO loan product.");
    }
    if (group.type !== "SACCO" && input.productId) {
      throw new BadRequestException("Loan products are only available in SACCO workspaces.");
    }
    const product = input.productId
      ? await this.prisma.saccoLoanProduct.findFirst({ where: { id: input.productId, groupId: group.id }, select: { id: true } })
      : null;
    if (input.productId && !product) throw new BadRequestException("Choose a loan product in this SACCO.");
    const chosenMemberId = ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON"].includes(role) ? input.memberId : ownMembership.id;
    const member = await this.prisma.groupMember.findFirst({
      where: { id: chosenMemberId, groupId: group.id, revokedAt: null, status: "APPROVED" },
      select: { id: true },
    });
    if (!member) throw new BadRequestException("Choose a member of your group.");
    const loan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.loan.create({
        data: {
          groupId: group.id,
          memberId: member.id,
          amountMinor: BigInt(input.amountKes) * 100n,
          purpose: input.purpose.trim(),
          productId: product?.id,
        },
        select: { id: true, amountMinor: true, purpose: true, status: true, createdAt: true, member: { select: { id: true, name: true } }, product: { select: { id: true, name: true, calculationMethod: true, annualInterestBps: true, termMonths: true } } },
      });
      await tx.auditEvent.create({
        data: { groupId: group.id, actorId: user.sub, action: "LOAN_REQUESTED", entityType: "Loan", entityId: created.id },
      });
      return created;
    });
    return { ...loan, amountMinor: loan.amountMinor.toString() };
  }

  @Post("loans/:id/decision")
  async decideLoan(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() input: DecideLoanDto,
  ) {
    const { group, role, member } = await this.getMembership(user);
    this.requireRole(role, ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON", "CREDIT_OFFICER"]);
    const loan = await this.prisma.loan.findFirst({ where: { id, groupId: group.id } });
    if (!loan) throw new NotFoundException("Loan request not found.");
    if (loan.status !== "PENDING") throw new ConflictException("This request has already been decided.");
    if (loan.memberId === member.id) throw new ForbiddenException("You cannot approve your own loan request.");
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.loan.updateMany({
        where: { id, groupId: group.id, status: "PENDING" },
        data: { status: input.status, decidedAt: new Date(), decidedById: user.sub },
      });
      if (updated.count !== 1) throw new ConflictException("This request has already been decided.");
      await tx.auditEvent.create({
        data: { groupId: group.id, actorId: user.sub, action: `LOAN_${input.status}`, entityType: "Loan", entityId: id },
      });
    });
    return this.prisma.loan.findUniqueOrThrow({
      where: { id },
      select: { id: true, amountMinor: true, purpose: true, status: true, createdAt: true, decidedAt: true, member: { select: { id: true, name: true } } },
    }).then((item) => ({ ...item, amountMinor: item.amountMinor.toString() }));
  }

  private parseDateOnly(value: string) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
  }

  private async getMembership(user: SessionUser) {
    if (user.personalWorkspace) {
      throw new BadRequestException("Select a group workspace to access group records.");
    }
    const membership = await this.prisma.groupMember.findFirst({
      where: { userId: user.sub, revokedAt: null, status: "APPROVED", ...(user.selectedGroupId ? { groupId: user.selectedGroupId } : {}) },
      orderBy: { joinedAt: "asc" },
      include: { group: true },
    });
    if (!membership) throw new NotFoundException("Your account is not linked to a group.");
    return { group: membership.group, role: membership.role, member: membership };
  }

  private requireRole(actual: string, allowed: string[]) {
    if (!allowed.includes(actual)) throw new ForbiddenException("You do not have permission to perform this action.");
  }

  private requireSacco(type: string) {
    if (type !== "SACCO") throw new BadRequestException("Select a SACCO workspace to access these records.");
  }

  private requireAssignableRole(groupType: string, role: string) {
    const allowed = groupType === "SACCO"
      ? ["MEMBER", "SECRETARY", "TREASURER", "CREDIT_OFFICER"]
      : ["MEMBER", "TREASURER"];
    this.requireRole(role, allowed);
  }

  private normalizePhone(phone: string) {
    if (phone.startsWith("+")) return phone;
    if (phone.startsWith("0")) return `+254${phone.slice(1)}`;
    return `+${phone}`;
  }

  private isUniqueError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
  }
}
