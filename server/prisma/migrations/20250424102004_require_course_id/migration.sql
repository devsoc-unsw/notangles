/*
  Warnings:

  - Made the column `courseId` on table `classes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "classes" ALTER COLUMN "courseId" SET NOT NULL;
