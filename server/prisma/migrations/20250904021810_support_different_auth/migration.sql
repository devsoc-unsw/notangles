/*
  Warnings:

  - You are about to drop the column `oidcId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authProvider,authSubject]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'ZID');

-- DropIndex
DROP INDEX "user_oidcId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "oidcId",
ADD COLUMN     "authProvider" "AuthProvider",
ADD COLUMN     "authSubject" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "user_authProvider_authSubject_key" ON "user"("authProvider", "authSubject");
