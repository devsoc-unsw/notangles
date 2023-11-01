// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
// initialize Prisma Client
const prisma = new PrismaClient();
const maximumZidNumber = 9e7;
const minimumZidNumber = 1e7;

const getZid = (): number => {
  return Math.floor(
    Math.random() * (maximumZidNumber - minimumZidNumber + 1) +
      minimumZidNumber,
  );
};
// TODO
const generateTimetable = async () => {};

const generateUsers = async (
  numUsers: number,
  generateTimetablesForAllUsers?: boolean,
) => {
  for (let i = 0; i < numUsers; i++) {
    const zid = getZid().toString();
    const user = await prisma.user.upsert({
      where: { zid: zid },
      update: {},
      create: {
        zid: zid,
        email: `z${zid}@unsw.edu.au`,
      },
    });
    console.log(user);
  }
};

async function main() {
  generateUsers(2);
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
