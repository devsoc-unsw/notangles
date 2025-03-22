-- AlterTable
ALTER TABLE "_TimetableToUser" ADD CONSTRAINT "_TimetableToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TimetableToUser_AB_unique";

-- AlterTable
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_admins_AB_unique";

-- AlterTable
ALTER TABLE "_friend_requests" ADD CONSTRAINT "_friend_requests_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_friend_requests_AB_unique";

-- AlterTable
ALTER TABLE "_group_members" ADD CONSTRAINT "_group_members_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_group_members_AB_unique";

-- AlterTable
ALTER TABLE "_group_timetables" ADD CONSTRAINT "_group_timetables_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_group_timetables_AB_unique";

-- AlterTable
ALTER TABLE "_user_friends" ADD CONSTRAINT "_user_friends_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_user_friends_AB_unique";
