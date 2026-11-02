CREATE TABLE "SavingsGoal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT,
    "title" VARCHAR(80) NOT NULL,
    "targetMinor" BIGINT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SavingsGoal_targetMinor_positive" CHECK ("targetMinor" > 0),
    CONSTRAINT "SavingsGoal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavingsGoal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GroupMember"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Contribution" ADD COLUMN "savingsGoalId" TEXT;
ALTER TABLE "Contribution"
    ADD CONSTRAINT "Contribution_savingsGoalId_fkey"
    FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Contribution_savingsGoalId_idx" ON "Contribution"("savingsGoalId");

CREATE INDEX "SavingsGoal_groupId_deadline_idx" ON "SavingsGoal"("groupId", "deadline");
CREATE INDEX "SavingsGoal_memberId_deadline_idx" ON "SavingsGoal"("memberId", "deadline");
