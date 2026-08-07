-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CUSTOM', 'TUTORING');

-- CreateTable
CREATE TABLE "user" (
    "id" VARCHAR(30) NOT NULL,
    "oidcId" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "userId" TEXT NOT NULL,
    "preferredTheme" TEXT NOT NULL DEFAULT 'classic',
    "use24HourClock" BOOLEAN NOT NULL DEFAULT false,
    "useDarkMode" BOOLEAN NOT NULL DEFAULT false,
    "useSquareEdges" BOOLEAN NOT NULL DEFAULT false,
    "hideFullClasses" BOOLEAN NOT NULL DEFAULT false,
    "hideClassInfo" BOOLEAN NOT NULL DEFAULT false,
    "unscheduleClassesByDefault" BOOLEAN NOT NULL DEFAULT true,
    "hideExamClasses" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "timetable" (
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "selectedClasses" TEXT[],
    "colour" TEXT NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,
    "type" "EventType" NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_oidcId_key" ON "user"("oidcId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
