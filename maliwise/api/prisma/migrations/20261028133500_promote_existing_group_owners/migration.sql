WITH ranked_admins AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "groupId" ORDER BY "joinedAt" ASC, "id" ASC) AS "position"
    FROM "GroupMember"
    WHERE "role" = 'ADMIN'
)
UPDATE "GroupMember"
SET "role" = 'OWNER'
FROM ranked_admins
WHERE "GroupMember"."id" = ranked_admins."id"
  AND ranked_admins."position" = 1;
