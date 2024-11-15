/*
  Warnings:

  - You are about to drop the column `classType` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `courseName` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `timetables` table. All the data in the column will be lost.
  - Added the required column `classNo` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseCode` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtype` to the `events` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `day` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `mapKey` to the `timetables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "classes" DROP COLUMN "classType",
DROP COLUMN "courseName",
ADD COLUMN     "classNo" TEXT NOT NULL,
ADD COLUMN     "courseCode" TEXT NOT NULL,
ADD COLUMN     "term" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "subtype" TEXT NOT NULL,
DROP COLUMN "day",
ADD COLUMN     "day" INTEGER NOT NULL,
DROP COLUMN "start",
ADD COLUMN     "start" INTEGER NOT NULL,
DROP COLUMN "end",
ADD COLUMN     "end" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "timetables" DROP COLUMN "userID",
ADD COLUMN     "mapKey" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ClassType";
