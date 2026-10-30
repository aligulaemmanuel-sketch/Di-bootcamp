ALTER TABLE "GroupMember"
ADD COLUMN "revokedAt" TIMESTAMP(3);

ALTER TABLE "MemberInvitation"
ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE INDEX "GroupMember_groupId_revokedAt_idx" ON "GroupMember"("groupId", "revokedAt");
