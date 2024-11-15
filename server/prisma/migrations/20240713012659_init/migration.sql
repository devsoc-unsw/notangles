-- CreateEnum
CREATE TYPE "group_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('LECTURE', 'TUTORIAL', 'LAORATORY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "firstname" TEXT,
    "lastname" TEXT,
    "email" TEXT NOT NULL,
    "profileURL" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageURL" TEXT,
    "visibility" "group_visibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "colour" TEXT NOT NULL DEFAULT '#1F7E8C',
    "day" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "timetableId" TEXT,
    "groupIds" TEXT[],

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "classType" "ClassType" NOT NULL,
    "courseName" TEXT,
    "timetableId" TEXT
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "selectedCourses" TEXT[],
    "userID" TEXT NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "userID" TEXT NOT NULL,
    "is12HourMode" BOOLEAN NOT NULL,
    "isDarkMode" BOOLEAN NOT NULL,
    "isSquareEdges" BOOLEAN NOT NULL,
    "isHideFullClasses" BOOLEAN NOT NULL,
    "isDefaultUnscheduled" BOOLEAN NOT NULL,
    "isHideClassInfo" BOOLEAN NOT NULL,
    "isSortAlphabetic" BOOLEAN NOT NULL,
    "isShowOnlyOpenClasses" BOOLEAN NOT NULL,
    "isHideExamClasses" BOOLEAN NOT NULL,
    "isConvertToLocalTimezone" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_friend_requests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_group_timetables" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_group_members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_admins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TimetableToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "users_userID_idx" ON "users"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "classes_id_key" ON "classes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_id_key" ON "timetables"("id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userID_key" ON "settings"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sid_key" ON "sessions"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "_user_friends_AB_unique" ON "_user_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_user_friends_B_index" ON "_user_friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_friend_requests_AB_unique" ON "_friend_requests"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_requests_B_index" ON "_friend_requests"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_group_timetables_AB_unique" ON "_group_timetables"("A", "B");

-- CreateIndex
CREATE INDEX "_group_timetables_B_index" ON "_group_timetables"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_group_members_AB_unique" ON "_group_members"("A", "B");

-- CreateIndex
CREATE INDEX "_group_members_B_index" ON "_group_members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_admins_AB_unique" ON "_admins"("A", "B");

-- CreateIndex
CREATE INDEX "_admins_B_index" ON "_admins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TimetableToUser_AB_unique" ON "_TimetableToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TimetableToUser_B_index" ON "_TimetableToUser"("B");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "_group_timetables" ADD CONSTRAINT "_group_timetables_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_timetables" ADD CONSTRAINT "_group_timetables_B_fkey" FOREIGN KEY ("B") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_members" ADD CONSTRAINT "_group_members_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_members" ADD CONSTRAINT "_group_members_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TimetableToUser" ADD CONSTRAINT "_TimetableToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TimetableToUser" ADD CONSTRAINT "_TimetableToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;