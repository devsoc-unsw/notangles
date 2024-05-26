/*
  Warnings:

  - You are about to drop the column `userId` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `timetables` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userID` to the `settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `timetables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TimetableToUser" DROP CONSTRAINT "_TimetableToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_admins" DROP CONSTRAINT "_admins_B_fkey";

-- DropForeignKey
ALTER TABLE "_friend_requests" DROP CONSTRAINT "_friend_requests_A_fkey";

-- DropForeignKey
ALTER TABLE "_friend_requests" DROP CONSTRAINT "_friend_requests_B_fkey";

-- DropForeignKey
ALTER TABLE "_group_members" DROP CONSTRAINT "_group_members_B_fkey";

-- DropForeignKey
ALTER TABLE "_user_friends" DROP CONSTRAINT "_user_friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_user_friends" DROP CONSTRAINT "_user_friends_B_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_userId_fkey";

-- DropIndex
DROP INDEX "settings_userId_key";

-- DropIndex
DROP INDEX "users_userId_idx";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "userId",
ADD COLUMN     "userID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "timetables" DROP COLUMN "userId",
ADD COLUMN     "userID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userID" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("userID");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userID_key" ON "settings"("userID");

-- CreateIndex
CREATE INDEX "users_userID_idx" ON "users"("userID");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_friends" ADD CONSTRAINT "_user_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_friends" ADD CONSTRAINT "_user_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_requests" ADD CONSTRAINT "_friend_requests_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_requests" ADD CONSTRAINT "_friend_requests_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_members" ADD CONSTRAINT "_group_members_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TimetableToUser" ADD CONSTRAINT "_TimetableToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
