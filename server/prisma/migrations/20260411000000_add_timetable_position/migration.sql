-- AlterTable: add position column, backfill with deterministic order per user/year/term,
-- then enforce NOT NULL. Using ROW_NUMBER so existing rows get 0-indexed positions.
ALTER TABLE "timetable" ADD COLUMN "position" INTEGER;

UPDATE "timetable" t
SET "position" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId", year, term ORDER BY id) AS rn
  FROM "timetable"
) sub
WHERE t.id = sub.id;

ALTER TABLE "timetable" ALTER COLUMN "position" SET NOT NULL;
