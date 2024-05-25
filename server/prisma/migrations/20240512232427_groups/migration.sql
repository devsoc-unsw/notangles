-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupTimetable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GroupMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupTimetable_AB_unique" ON "_GroupTimetable"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupTimetable_B_index" ON "_GroupTimetable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupMember_AB_unique" ON "_GroupMember"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupMember_B_index" ON "_GroupMember"("B");

-- AddForeignKey
ALTER TABLE "_GroupTimetable" ADD CONSTRAINT "_GroupTimetable_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTimetable" ADD CONSTRAINT "_GroupTimetable_B_fkey" FOREIGN KEY ("B") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMember" ADD CONSTRAINT "_GroupMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMember" ADD CONSTRAINT "_GroupMember_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
