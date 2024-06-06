import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

// !! WARNING: these tests will ruin your local db container
// Before running these integration tests, spin up the DB first (docker compose up).
describe('Integration testing for user/friend db endpoints', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    // To connect testing module to db container, need to change hostname to localhost. There's probably a better way to do this, but ¯\_(ツ)_/¯ idk
    const prev = process.env.DATABASE_URL;

    process.env.DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`;
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    // Change it back after we're done
    process.env.DATABASE_URL = prev;
  });

  // Reset the DB before the tests
  beforeEach(async () => {
    const prisma = module.get<PrismaService>(PrismaService);
    await prisma.$transaction([
      prisma.settings.deleteMany(),
      prisma.user.deleteMany(),
      prisma.timetable.deleteMany(),
      prisma.event.deleteMany(),
      prisma.class.deleteMany(),
    ]);
  });

  test('Basic create, read, and update tests for user and settings', async () => {
    const user = {
      userID: 'z55555555',
      firstname: 'First',
      lastname: 'Last',
      email: 'test@gmail.com',
      profileURL: 'images.google.com/blahblah',
    };

    const setting = {
      is12HourMode: true,
      isDarkMode: true,
      isSquareEdges: true,
      isHideFullClasses: true,
      isDefaultUnscheduled: true,
      isHideClassInfo: true,
      isSortAlphabetic: true,
      isShowOnlyOpenClasses: true,
      isHideExamClasses: false,
      isConvertToLocalTimezone: true,
    };
    // Create new user
    let res = await request(app.getHttpServer())
      .put('/user/profile')
      .send({ data: user });

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('Successfully created user!');
    expect(res.body.data).toMatchObject(user);

    // Fetch user profile - no friends etc
    res = await request(app.getHttpServer()).get(
      `/user/profile/${user.userID}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('Successsfully returned user profile');
    expect(res.body.data).toMatchObject(user);
    expect(res.body.data).toMatchObject({
      friends: [],
      incoming: [],
      outgoing: [],
      timetables: [],
    });

    // Set settings
    res = await request(app.getHttpServer()).put('/user/settings').send({
      userId: user.userID,
      setting,
    });
    expect(res.status).toEqual(200);
    expect(res.body.data).toMatchObject(setting);
    expect(res.body.status).toEqual('Successfully edited user settings!');

    // Fetch settings
    res = await request(app.getHttpServer()).get(
      `/user/settings/${user.userID}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.data).toEqual(setting);
    expect(res.body.status).toEqual(
      'Successfully found user and their settings!',
    );

    // Update user information
    const modifiedUser = {
      ...user,
      email: 'new@outlook.com',
      firstname: 'new',
      profileURL: 'test',
    };

    res = await request(app.getHttpServer())
      .put('/user/profile')
      .send({ data: modifiedUser });

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('Successfully created user!'); // A bit misleading honestly, but whatever
    expect(res.body.data).toMatchObject(modifiedUser);

    // Update settings
    const modifiedSetting = {
      ...setting,
      isDarkMode: !setting.isDarkMode,
      isSquareEdges: !setting.isSquareEdges,
      isHideClassInfo: !setting.isHideClassInfo,
    };

    res = await request(app.getHttpServer()).put('/user/settings').send({
      userId: user.userID,
      setting: modifiedSetting,
    });
    expect(res.status).toEqual(200);
    expect(res.body.data).toMatchObject(modifiedSetting);
    expect(res.body.status).toEqual('Successfully edited user settings!');
  });

  // TODO: Friends tests, timetables tests, error tests
});
