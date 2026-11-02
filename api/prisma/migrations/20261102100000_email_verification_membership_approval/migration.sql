CREATE TYPE "MembershipStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

ALTER TABLE "GroupMember"
ADD COLUMN "status" "MembershipStatus" NOT NULL DEFAULT 'APPROVED';

ALTER TABLE "User"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "emailVerificationTokenHash" TEXT,
ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);

UPDATE "User" SET "emailVerifiedAt" = "createdAt";

CREATE UNIQUE INDEX "User_emailVerificationTokenHash_key"
ON "User"("emailVerificationTokenHash");
