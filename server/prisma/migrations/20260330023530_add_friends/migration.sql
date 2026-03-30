/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('REQ_UID1', 'REQ_UID2', 'FRIEND');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "inviteCode" CHAR(6) NOT NULL;

-- CreateTable
CREATE TABLE "friendship" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friendship_user1Id_user2Id_key" ON "friendship"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "user_inviteCode_key" ON "user"("inviteCode");

-- CreateIndex
CREATE INDEX "user_inviteCode_idx" ON "user"("inviteCode");
