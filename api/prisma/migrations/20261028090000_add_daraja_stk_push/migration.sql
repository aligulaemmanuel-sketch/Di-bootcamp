CREATE TYPE "DarajaPaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

CREATE TABLE "DarajaConfiguration" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "shortcode" TEXT NOT NULL,
    "consumerKeyEncrypted" TEXT NOT NULL,
    "consumerSecretEncrypted" TEXT NOT NULL,
    "passkeyEncrypted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DarajaConfiguration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DarajaConfiguration_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "DarajaPayment" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "savingsGoalId" TEXT,
    "amountMinor" BIGINT NOT NULL,
    "phone" TEXT NOT NULL,
    "callbackToken" TEXT NOT NULL,
    "merchantRequestId" TEXT,
    "checkoutRequestId" TEXT,
    "callbackResultCode" INTEGER,
    "callbackAmountMinor" BIGINT,
    "callbackPhone" TEXT,
    "callbackReceipt" TEXT,
    "status" "DarajaPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "resultDescription" TEXT,
    "mpesaReceipt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DarajaPayment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DarajaPayment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DarajaPayment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DarajaPayment_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DarajaPayment_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "Contribution" ADD COLUMN "darajaPaymentId" TEXT;
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_darajaPaymentId_fkey"
    FOREIGN KEY ("darajaPaymentId") REFERENCES "DarajaPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "DarajaConfiguration_groupId_key" ON "DarajaConfiguration"("groupId");
CREATE UNIQUE INDEX "DarajaPayment_callbackToken_key" ON "DarajaPayment"("callbackToken");
CREATE UNIQUE INDEX "DarajaPayment_checkoutRequestId_key" ON "DarajaPayment"("checkoutRequestId");
CREATE UNIQUE INDEX "DarajaPayment_mpesaReceipt_key" ON "DarajaPayment"("mpesaReceipt");
CREATE INDEX "DarajaPayment_groupId_createdAt_idx" ON "DarajaPayment"("groupId", "createdAt");
CREATE INDEX "DarajaPayment_memberId_createdAt_idx" ON "DarajaPayment"("memberId", "createdAt");
CREATE UNIQUE INDEX "Contribution_darajaPaymentId_key" ON "Contribution"("darajaPaymentId");
