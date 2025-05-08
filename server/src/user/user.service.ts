import { Injectable } from '@nestjs/common';
import {
  SettingsDto,
  UserDTO,
  EventDto,
  TimetableDto,
  ClassDto,
  InitUserDTO,
  ScrapedClassDto,
  ReconstructedTimetableDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import { GroupDto } from 'src/group/dto/group.dto';
import { GraphqlService } from 'src/graphql/graphql.service';

@Injectable({})
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gql: GraphqlService,
  ) { }

  private async convertClasses(
    classes: ClassDto[],
  ): Promise<ScrapedClassDto[]> {
    try {
      // For each class in class DTO, we need to fetch information
      const cache = {};
      for (const clz of classes) {
        const k = `${clz.year}-${clz.term}/courses/${clz.courseCode}`;

        if (!(k in cache) && clz.classNo !== '') {
          const courseInfoFetchPromise = await this.gql.fetchCourseData(
            clz.courseCode,
            clz.term,
            clz.year,
          );
          const courseInfoFetch = courseInfoFetchPromise.data.courses;
          cache[k] = courseInfoFetch[0].classes;
        }
      }

      const res = classes.map((clz) => {
        if (clz.classNo === '')
          return {
            classID: '',
            courseCode: clz.courseCode,
            activity: clz.activity,
          };
        const k = `${clz.year}-${clz.term}/courses/${clz.courseCode}`;
        const {
          class_id,
          course_enrolment,
          consent,
          times,
          class_notes,
          ...data
        } = cache[k].find((c) => c.class_id === clz.classNo);

        const [enrolments, capacity] = course_enrolment.split('/');
        const [start, end] = times[0].time.replace(/\s/g, '').split('-');
        return {
          ...data,
          classID: class_id,
          courseEnrolment: {
            enrolments: Number(enrolments),
            capacity: Number(capacity),
          },
          termDates: {
            start: '',
            end: '',
          },
          times: { ...times[0], time: { start, end } },
          needsConsent: consent == 'Consent not required',
          courseCode: clz.courseCode,
          notes: [class_notes],
        };
      });

      return res;
    } catch (e) {
      throw new Error(e);
    }
  }

  private async convertTimetable(timetable: TimetableDto): Promise<any> {
    try {
      const c = await this.convertClasses(timetable.selectedClasses);

      return {
        ...timetable,
        selectedClasses: c,
      };
    } catch (e) {
      throw new Error(e);
    }
  }
  async getUserInfo(_userID: string): Promise<UserDTO> {
    if (globalThis?.window !== undefined) {
      console.log('BEFORE getUserInfo - localStorage', (JSON.parse(window.localStorage.data)).timetables);
    }
    const { userID, timetables, ...userData } =
      await this.prisma.user.findUniqueOrThrow({
        where: { userID: _userID },
        include: {
          timetables: {
            include: {
              createdEvents: true,
              selectedClasses: true,
            },
          },
          friends: true,
          outgoing: true,
          incoming: true,
        },
      });

    // here? for getting timetable data
    // instead of whats in getUserTimetables
    console.log('getUserInfo - timetables', timetables);
    console.log('condition', globalThis?.window !== undefined)
    // typeof window !== 'undefined' && window.localStorage
    if (globalThis?.window !== undefined) {
      // UP TO HERE - looking at what localStorage looks like/structure at this point of the code, seeing if it can be easily added to `timetables`
      // CURRENT PROBLEM - can't find a way to access localStorage
      console.log('AFTER getUserInfo - localStorage', (JSON.parse(localStorage.data)).timetables);
    }

    let isTimetableEmpty = false;
    // dont forget to account for createdEvents in 'empty' timetables


    const reconstructedTables = await Promise.all(
      timetables.map(async (t) => {
        return this.convertTimetable(t);
      }),
    );

    const data = {
      userID,
      ...userData,
      createdAt: userData.createdAt.toISOString(),
      lastLogin: userData.lastLogin.toISOString(),
      timetables: reconstructedTables,
    };

    return Promise.resolve(data);
  }

  async setUserProfile(data: InitUserDTO): Promise<any> {
    try {
      return Promise.resolve(
        this.prisma.user.upsert({
          where: {
            userID: data.userID,
          },
          create: data,
          update: data,
        }),
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getUserSettings(_userID: string): Promise<SettingsDto> {
    try {
      const { userID, ...settings } =
        await this.prisma.settings.findUniqueOrThrow({
          where: { userID: _userID },
        });

      return Promise.resolve(settings);
    } catch (e) {
      throw new Error(e);
    }
  }

  async setUserSettings(
    _userID: string,
    setting: SettingsDto,
  ): Promise<SettingsDto> {
    try {
      return Promise.resolve(
        this.prisma.settings.upsert({
          where: {
            userID: _userID,
          },
          create: { userID: _userID, ...setting },
          update: setting,
        }),
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getUserTimetables(
    _userID: string,
  ): Promise<ReconstructedTimetableDto[]> {
    try {
      console.log("")

      // user timetable needs to be checked on get - 
      // as soon as the timetable loads, it should be checked if its 
      // empty and can therefore be overwritten from local storage
      // (calling editUserTimetable or whatever)

      const res = await this.prisma.user.findUniqueOrThrow({
        where: { userID: _userID },
        select: {
          timetables: {
            include: {
              createdEvents: true,
              selectedClasses: true,
            },
          },
        },
      });

      const timetables = await Promise.all(
        res.timetables.map(async (t) => {
          return this.convertTimetable(t);
        }),
      );

      // const isTimetableEmpty = _timetable.selectedCourses.length === 0;
      // console.log('ISTIMETABLEEMPTY -> ', isTimetableEmpty);
      console.log('getUserTimetables - timetables', timetables);
      console.log('getUserTimetables - localStorage', localStorage);

      return Promise.resolve(timetables);
    } catch (e) {
      throw new Error(e);
    }
  }

  async createUserTimetable(
    _userID: string,
    _selectedCourses: string[],
    _selectedClasses: ClassDto[],
    _createdEvents: EventDto[],
    _mapKey: string,
    _timetableName?: string,
  ): Promise<any> {
    try {
      // Generate random timetable id
      const _timetableId = uuidv4();

      await this.prisma.timetable.create({
        data: {
          id: _timetableId,
          name: _timetableName,
          selectedCourses: _selectedCourses,
          mapKey: _mapKey,
          selectedClasses: {
            create: _selectedClasses,
          },
          createdEvents: {
            create: _createdEvents,
          },
          user: {
            connect: {
              userID: _userID,
            },
          },
        },
      });

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async editUserTimetable(
    _userID: string,
    _timetable: TimetableDto,
  ): Promise<string> {
    const _timetableId = _timetable.id;
    const eventIds = _timetable.createdEvents.map((event) => event.id);
    const classIds = _timetable.createdEvents.map((c) => c.id);
    console.log("timetable stuff --> ", _timetable); // logs in terminal, not console

    const isTimetableEmpty = _timetable.selectedCourses.length === 0;
    console.log('ISTIMETABLEEMPTY -> ', isTimetableEmpty);
    console.log("TESTTTTTT");

    if (isTimetableEmpty) {
      // get timetable from localstorage
      // TODO: error here, "ReferenceError: localStorage is not defined"
      const data = JSON.parse(localStorage.getItem("data") || '')
      const timetables = data.timetables
      console.log('T1 timetable --- ', timetables);
    }

    const update_timetable = this.prisma.timetable.update({
      where: {
        id: _timetableId,
      },
      data: {
        name: _timetable.name,
        selectedCourses: _timetable.selectedCourses,
        mapKey: _timetable.mapKey,
      },
    });

    const delete_events = this.prisma.event.deleteMany({
      where: {
        timetableId: _timetableId,
        NOT: {
          id: { in: eventIds },
        },
      },
    });

    const update_events = _timetable.createdEvents.map((e) =>
      this.prisma.event.upsert({
        where: { id: e.id },
        update: e,
        create: { ...e, timetableId: _timetableId },
      }),
    );

    const delete_classes = this.prisma.class.deleteMany({
      where: {
        timetableId: _timetableId,
        NOT: {
          id: { in: classIds },
        },
      },
    });

    const update_classes = _timetable.selectedClasses.map((c) =>
      this.prisma.class.upsert({
        where: { id: c.id },
        update: c,
        create: {
          ...c,
          timetableId: _timetableId,
        },
      }),
    );

    await this.prisma.$transaction([
      update_timetable,
      delete_events,
      delete_classes,
      ...update_events,
      ...update_classes,
    ]);

    return Promise.resolve(_timetableId);
  }

  async getTimetablesByIDs(
    timetableIDs: string[],
  ): Promise<ReconstructedTimetableDto[]> {
    try {
      const timetables = await this.prisma.timetable.findMany({
        where: {
          id: {
            in: timetableIDs,
          },
        },
        include: {
          createdEvents: true,
          selectedClasses: true,
        },
      });

      return Promise.all(
        timetables.map(async (t) => {
          return this.convertTimetable(t);
        }),
      );
    } catch (error) {
      console.error('Error retrieving timetables:', error);
    }
  }

  async getUsersByIDs(userIDs: string[]): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          userID: {
            in: userIDs,
          },
        },
      });
      return users;
    } catch (error) {
      console.error('Error retrieving users:', error);
    }
  }

  async deleteUserTimetable(_timetableId: string): Promise<string> {
    try {
      await this.prisma.timetable.delete({
        where: {
          id: _timetableId,
        },
      });

      return Promise.resolve(_timetableId);
    } catch (e) {
      throw new Error(_timetableId);
    }
  }

  async getGroups(_userId: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { userID: _userId },
        include: {
          memberGroups: true,
          adminGroups: true,
        },
      });

      const groupIds = user.adminGroups
        .concat(user.memberGroups)
        .map((group) => group.id);

      const res: GroupDto[] = [];
      for (const groupId of groupIds) {
        const group = await this.prisma.group.findUniqueOrThrow({
          where: { id: groupId },
          include: {
            members: true,
            groupAdmins: true,
            timetables: true,
          },
        });

        res.push(group);
      }

      return res;
    } catch (error) {
      console.error('Error retrieving users:', error);
    }
  }

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany();
      const res = await Promise.all(
        users.map((user) => this.getUserInfo(user.userID)),
      );
      return res;
    } catch (error) {
      console.error('Error retrieving all users:', error);
    }
  }
}
