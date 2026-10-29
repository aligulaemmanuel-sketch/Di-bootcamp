ALTER TYPE "GroupRole" ADD VALUE 'OWNER';
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

CREATE TYPE "PersonalActivityKind" AS ENUM ('SAVING', 'INVESTMENT', 'INCOME', 'EXPENSE');

CREATE TABLE "PersonalGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "kind" "PersonalActivityKind" NOT NULL,
    "targetMinor" BIGINT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalGoal_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PersonalGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PersonalActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "kind" "PersonalActivityKind" NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalActivity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PersonalActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalActivity_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "PersonalGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "groupId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Reminder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reminderId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "smsSentAt" TIMESTAMP(3),
    "deliveryAttemptedAt" TIMESTAMP(3),
    "deliveryError" VARCHAR(500),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserNotification_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PersonalGoal_userId_targetDate_idx" ON "PersonalGoal"("userId", "targetDate");
CREATE INDEX "PersonalActivity_userId_occurredAt_idx" ON "PersonalActivity"("userId", "occurredAt");
CREATE INDEX "PersonalActivity_goalId_idx" ON "PersonalActivity"("goalId");
CREATE INDEX "Reminder_processedAt_dueAt_idx" ON "Reminder"("processedAt", "dueAt");
CREATE INDEX "Reminder_groupId_dueAt_idx" ON "Reminder"("groupId", "dueAt");
CREATE INDEX "Reminder_creatorId_dueAt_idx" ON "Reminder"("creatorId", "dueAt");
CREATE INDEX "UserNotification_userId_readAt_createdAt_idx" ON "UserNotification"("userId", "readAt", "createdAt");
CREATE INDEX "UserNotification_emailEnabled_emailSentAt_idx" ON "UserNotification"("emailEnabled", "emailSentAt");
CREATE INDEX "UserNotification_smsEnabled_smsSentAt_idx" ON "UserNotification"("smsEnabled", "smsSentAt");
