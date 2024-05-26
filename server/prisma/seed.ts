import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Shaam', zID: '532445' },
    { name: 'Ray', zID: '523495' },
    { name: 'hhlu', zID: '584290' },
    { name: 'Sohum', zID: '523840' },
    { name: 'Chanel', zID: '542567' },
    { name: 'Nikki', zID: '524596' },
    { name: 'Micky', zID: '523948' },
    { name: 'Jasmine', zID: '540938' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { userID: user.zID },
      update: {},
      create: {
        userID: user.zID,
        firstname: user.name,
        email: `${user.name.toLowerCase()}@example.com`,
        profileURL: `http://notangles.com/${user.name.toLowerCase()}`,
      },
    });
  }

  const user1 = await prisma.user.findUnique({
    where: { userID: '532445' },
  });

  const user2 = await prisma.user.findUnique({
    where: { userID: '523495' },
  });

  const timetable1 = await prisma.timetable.upsert({
    where: { id: 'Timetable 1' },
    update: {},
    create: {
      name: 'Timetable 1',
      selectedCourses: ['COMP4128', 'COMP6991'],
    },
  });

  const timetable2 = await prisma.timetable.create({
    data: {
      name: 'Timetable 2',
      selectedCourses: ['COMP3821', 'COMP9417'],
    },
  });

  const group1 = await prisma.group.create({
    data: {
      name: 'Group 1',
      description: 'This is group 1',
      visibility: 'PRIVATE',
      members: {
        connect: [{ userID: user1.userID }, { userID: user2.userID }],
      },
      groupAdmins: {
        connect: [{ userID: user1.userID }],
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'Group 2',
      description: 'This is group 2',
      visibility: 'PUBLIC',
      members: {
        connect: [{ userID: user2.userID }],
      },
      groupAdmins: {
        connect: [{ userID: user2.userID }],
      },
    },
  });

  const event1 = await prisma.event.create({
    data: {
      name: 'Event 1',
      day: 'Monday',
      start: new Date('2024-05-27T10:00:00Z'),
      end: new Date('2024-05-27T12:00:00Z'),
      groupIds: [group1.id, group2.id],
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Event 2',
      day: 'Tuesday',
      start: new Date('2024-05-28T14:00:00Z'),
      end: new Date('2024-05-28T16:00:00Z'),
      groupIds: [group1.id],
    },
  });

  await prisma.settings.create({
    data: {
      userID: user1.userID,
      is12HourMode: false,
      isDarkMode: true,
      isSquareEdges: false,
      isHideFullClasses: true,
      isDefaultUnscheduled: false,
      isHideClassInfo: true,
      isSortAlphabetic: true,
      isShowOnlyOpenClasses: false,
      isHideExamClasses: false,
      isConvertToLocalTimezone: true,
    },
  });

  await prisma.settings.create({
    data: {
      userID: user2.userID,
      is12HourMode: true,
      isDarkMode: false,
      isSquareEdges: true,
      isHideFullClasses: false,
      isDefaultUnscheduled: true,
      isHideClassInfo: false,
      isSortAlphabetic: false,
      isShowOnlyOpenClasses: true,
      isHideExamClasses: true,
      isConvertToLocalTimezone: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
