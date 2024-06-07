import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ClassType } from '@prisma/client';

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

  test('Add fetch and delete multiple timetables', async () => {
    // Create user
    const user = {
      userID: 'z55555555',
      firstname: 'First',
      lastname: 'Last',
      email: 'test@gmail.com',
      profileURL: 'images.google.com/blahblah',
    };
    let res = await request(app.getHttpServer())
      .put('/user/profile')
      .send({ data: user });
    expect(res.status).toEqual(200);

    // Create first timetable - (empty timetable)
    const firstTimetable = {
      selectedCourses: [],
      selectedClasses: [],
      createdEvents: [],
      name: 'timetable1',
    };

    res = await request(app.getHttpServer())
      .post('/user/timetable')
      .send({ userId: user.userID, ...firstTimetable });

    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual(
      'Successfully found user and created their new timetable!',
    );
    const firstTimetableId = res.body.data;

    // Create second timetable (filled timetable)
    const secondTimetable = {
      selectedCourses: ['COMP1511', 'COMP2511'],
      selectedClasses: [
        {
          id: 'c1',
          classType: ClassType.LABORATORY,
          courseCode: 'COMP1511',
          section: 'F111A',
        },
        {
          id: 'c2',
          classType: ClassType.LECTURE,
          courseCode: 'COMP2511',
          section: 'A',
        },
      ],
      createdEvents: [
        {
          id: 'e1',
          name: 'event1',
          location: 'UNSW',
          colour: 'FFFFFF',
          day: 'Monday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e2',
          name: 'event2',
          location: 'Online',
          colour: '000000',
          day: 'Tuesday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
      ],
      name: 'timetable2',
    };

    res = await request(app.getHttpServer())
      .post('/user/timetable')
      .send({ userId: user.userID, ...secondTimetable });

    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual(
      'Successfully found user and created their new timetable!',
    );
    const secondTimetableId = res.body.data;

    // Retrieve timetables
    res = await request(app.getHttpServer()).get(
      `/user/timetable/${user.userID}`,
    );

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual(`Successfully found user's timetables`);
    expect(res.body.data.length).toEqual(2);
    expect(res.body.data[0]).toMatchObject({
      ...firstTimetable,
      timetableId: firstTimetableId,
      userID: user.userID,
    });
    expect(res.body.data[1]).toMatchObject({
      ...secondTimetable,
      timetableId: secondTimetableId,
      userID: user.userID,
    });

    // Delete both timetables - one at a time, and check that they're gone
    res = await request(app.getHttpServer()).delete(
      `/user/timetable/${firstTimetableId}`,
    );
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('Successfully deleted timetable');
    expect(res.body.data).toEqual({ timetableId: firstTimetableId });

    res = await request(app.getHttpServer()).get(
      `/user/timetable/${user.userID}`,
    );
    expect(res.body.data.length).toEqual(1);
    expect(res.body.data[0]).toMatchObject({
      ...secondTimetable,
      timetableId: secondTimetableId,
      userID: user.userID,
    });

    res = await request(app.getHttpServer()).delete(
      `/user/timetable/${secondTimetableId}`,
    );
    expect(res.status).toEqual(200);

    res = await request(app.getHttpServer()).get(
      `/user/timetable/${user.userID}`,
    );
    expect(res.body.data.length).toEqual(0);
  });

  test('Update timetables', async () => {
    const timetable = {
      selectedCourses: ['COMP1511', 'COMP2511'],
      selectedClasses: [
        {
          id: 'c1',
          classType: ClassType.LABORATORY,
          courseCode: 'COMP1511',
          section: 'F111A',
        },
        {
          id: 'c2',
          classType: ClassType.LECTURE,
          courseCode: 'COMP2511',
          section: 'A',
        },
        {
          id: 'c3',
          classType: ClassType.OTHER,
          courseCode: 'COMP2511',
          section: 'B123',
        },
      ],
      createdEvents: [
        {
          id: 'e1',
          name: 'event1',
          location: 'UNSW',
          colour: 'FFFFFF',
          day: 'Monday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e2',
          name: 'event2',
          location: 'Online',
          colour: '000000',
          day: 'Tuesday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
        {
          id: 'e3',
          name: 'event3',
          location: 'CBD',
          colour: '000000',
          day: 'Friday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
      ],
      name: 'my timetable',
    };

    // Create user and timetable
    const user = {
      userID: 'z55555555',
      firstname: 'First',
      lastname: 'Last',
      email: 'test@gmail.com',
      profileURL: 'images.google.com/blahblah',
    };
    let res = await request(app.getHttpServer())
      .put('/user/profile')
      .send({ data: user });
    expect(res.status).toEqual(200);

    res = await request(app.getHttpServer())
      .post('/user/timetable')
      .send({ userId: user.userID, ...timetable });

    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual(
      'Successfully found user and created their new timetable!',
    );

    const timetableId = res.body.data;

    // Edit timetable (remove one class/event, add one new one, edit one, and leave one the same)
    const editedTimetable = {
      name: 'updated timetable',
      selectedCourses: ['COMP2511', 'COMP2521'],
      selectedClasses: [
        timetable.selectedClasses[1],
        { ...timetable.selectedClasses[2], section: 'A321' },
        {
          id: 'c4',
          classType: ClassType.LECTURE,
          courseCode: 'COMP2521',
          section: 'C',
        },
      ],
      createdEvents: [
        timetable.createdEvents[1],
        {
          ...timetable.createdEvents[2],
          name: 'update',
          location: 'Underground bunker #12',
          colour: '111111',
          end: '2018-11-22T13:28:06.419Z',
        },
        {
          id: 'e4',
          name: 'New event',
          location: 'Outer space',
          colour: '123456',
          day: 'Thursday',
          start: '2013-10-21T13:28:06.419Z',
          end: '2013-10-21T13:28:06.419Z',
        },
      ],
    };
    res = await request(app.getHttpServer())
      .put('/user/timetable')
      .send({
        userId: user.userID,
        timetable: { timetableId, ...editedTimetable },
      });

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('Successfully edited timetable');
    expect(res.body.data).toEqual({ id: timetableId });

    // Finally, check if timetable is correctly updated
    res = await request(app.getHttpServer()).get(
      `/user/timetable/${user.userID}`,
    );
    expect(res.body.data.length).toEqual(1);
    expect(res.body.data[0]).toMatchObject({
      ...editedTimetable,
      timetableId,
      userID: user.userID,
    });
  });
});
