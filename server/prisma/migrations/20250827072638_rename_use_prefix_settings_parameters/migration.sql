/*
  Warnings:

  - You are about to drop the column `use24HourClock` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `useDarkMode` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `useSquareEdges` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "settings" DROP COLUMN "use24HourClock",
DROP COLUMN "useDarkMode",
DROP COLUMN "useSquareEdges",
ADD COLUMN     "is12HourMode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDarkMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSquareEdges" BOOLEAN NOT NULL DEFAULT false;
