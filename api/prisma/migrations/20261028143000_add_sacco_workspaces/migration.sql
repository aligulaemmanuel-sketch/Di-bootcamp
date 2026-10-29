CREATE TYPE "GroupType" AS ENUM ('CHAMA', 'SACCO');

CREATE TYPE "SaccoEntryKind" AS ENUM ('SHARE_CAPITAL', 'DEPOSIT', 'WITHDRAWAL');

CREATE TYPE "SaccoAccountType" AS ENUM ('BOSA', 'FOSA');

CREATE TYPE "LoanCalculationMethod" AS ENUM ('FLAT', 'REDUCING_BALANCE');

ALTER TYPE "GroupRole" ADD VALUE 'CHAIRPERSON';
ALTER TYPE "GroupRole" ADD VALUE 'SECRETARY';
ALTER TYPE "GroupRole" ADD VALUE 'CREDIT_OFFICER';

ALTER TABLE "Group"
ADD COLUMN "type" "GroupType" NOT NULL DEFAULT 'CHAMA';

CREATE TABLE "SaccoEntry" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "kind" "SaccoEntryKind" NOT NULL,
    "accountType" "SaccoAccountType" NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "reference" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaccoEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaccoEntry_reference_key" ON "SaccoEntry"("reference");
CREATE UNIQUE INDEX "SaccoEntry_idempotencyKey_key" ON "SaccoEntry"("idempotencyKey");
CREATE INDEX "SaccoEntry_groupId_createdAt_idx" ON "SaccoEntry"("groupId", "createdAt");
CREATE INDEX "SaccoEntry_memberId_createdAt_idx" ON "SaccoEntry"("memberId", "createdAt");
CREATE INDEX "SaccoEntry_groupId_kind_createdAt_idx" ON "SaccoEntry"("groupId", "kind", "createdAt");

ALTER TABLE "SaccoEntry"
ADD CONSTRAINT "SaccoEntry_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SaccoEntry"
ADD CONSTRAINT "SaccoEntry_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "GroupMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SaccoEntry"
ADD CONSTRAINT "SaccoEntry_recordedById_fkey"
FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SaccoLoanProduct" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "calculationMethod" "LoanCalculationMethod" NOT NULL,
    "annualInterestBps" INTEGER NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaccoLoanProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaccoLoanProduct_groupId_name_key" ON "SaccoLoanProduct"("groupId", "name");
CREATE INDEX "SaccoLoanProduct_groupId_createdAt_idx" ON "SaccoLoanProduct"("groupId", "createdAt");

ALTER TABLE "SaccoLoanProduct"
ADD CONSTRAINT "SaccoLoanProduct_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SaccoLoanProduct"
ADD CONSTRAINT "SaccoLoanProduct_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Loan"
ADD COLUMN "productId" TEXT;

ALTER TABLE "Loan"
ADD CONSTRAINT "Loan_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "SaccoLoanProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
