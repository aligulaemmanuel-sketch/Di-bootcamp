CREATE TYPE "FinancialProviderType" AS ENUM ('BANK', 'MMF', 'INVESTMENT');

CREATE TABLE "FinancialProviderSetup" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "type" "FinancialProviderType" NOT NULL,
    "providerName" VARCHAR(100) NOT NULL,
    "maskedIdentifier" VARCHAR(40),
    "productName" VARCHAR(120),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProviderSetup_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FinancialProviderSetup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FinancialProviderSetup_groupId_type_key"
ON "FinancialProviderSetup"("groupId", "type");

CREATE INDEX "FinancialProviderSetup_groupId_idx"
ON "FinancialProviderSetup"("groupId");
