import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { TimetableService } from 'src/timetable/timetable.service';
import { ConstraintDTO } from './types';
import {
  AUTOTIMETABLER_PACKAGE_NAME,
  AutoTimetablerClient,
  TimetableConstraints,
  TimetableConstraints_PeriodInfo,
} from './proto/autotimetabler';

@Injectable()
export class AutoService {
  private autotimetablerClient: AutoTimetablerClient;
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
    private readonly timetableService: TimetableService,
    @Inject(AUTOTIMETABLER_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.autotimetablerClient =
      this.client.getService<AutoTimetablerClient>('AutoTimetabler');
  }

  async generateAutoTimetable(
    userId: string,
    timetableId: string,
    constraints: ConstraintDTO,
  ) {
    // get the selected Course Id from the timetable_id
    let courseIds: string[] = [];
    let term: string;
    try {
      const courses = await this.prisma.timetable.findUniqueOrThrow({
        where: { id: timetableId, userId: userId },
        select: {
          term: true,
          courses: { select: { courseId: true } },
        },
      });
      courseIds = courses.courses.map((course) => course.courseId);
      term = courses.term;
    } catch {
      throw new Error('Timetable not found');
    }
    // call the graphql to get all the classes on each course
    // There are three modes: in person, online, hybrid, need to filter classes accordingly
    const classes = await this.graphqlService.getAllClassesFromCourses(
      courseIds,
      constraints.mode,
      term,
    );

    // TODO parse the class data into format for auto-timetable generator
    // Group classes by course_id and activity
    const classesByCourseAndActivity: {
      [courseId: string]: { [activity: string]: typeof classes };
    } = {};
    for (const cls of classes) {
      if (!classesByCourseAndActivity[cls.course_id]) {
        classesByCourseAndActivity[cls.course_id] = {};
      }
      if (!classesByCourseAndActivity[cls.course_id][cls.activity]) {
        classesByCourseAndActivity[cls.course_id][cls.activity] = [];
      }
      classesByCourseAndActivity[cls.course_id][cls.activity].push(cls);
    }
    // prepare the data for auto-timetable generator
    // Construct PeriodInfo for each activity in each course

    const periodInfos: TimetableConstraints_PeriodInfo[] = Object.keys(
      classesByCourseAndActivity,
    ).flatMap((courseId: string) =>
      Object.keys(classesByCourseAndActivity[courseId]).map((activity) => {
        const activityClasses = classesByCourseAndActivity[courseId][activity];

        return {
          periodsPerClass: activityClasses[0].times.length,
          durations: activityClasses[0].times.map((t) => {
            const [startStr, endStr] = t.time.split(' - ');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const [endHour, endMinute] = endStr.split(':').map(Number);
            return endHour + endMinute / 60 - (startHour + startMinute / 60);
          }),
          periodTimes: activityClasses
            .flatMap((cls) =>
              cls.times.map((t) => {
                const dayOfWeek =
                  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
                    t.day,
                  ) + 1;
                const [startStr] = t.time.split(' - ');
                const [startHour, startMinute] = startStr
                  .split(':')
                  .map(Number);
                return [dayOfWeek, startHour + startMinute / 60];
              }),
            )
            .flat(),
        };
      }),
    );
    const timetableConstraints: TimetableConstraints = {
      start: constraints.startHour,
      end: constraints.endHour,
      days: constraints.selectedDaysStr,
      gap: constraints.breaksBetweenClasses,
      maxdays: constraints.daysAtUni,
      periodInfo: periodInfos,
    };

    return this.autotimetablerClient.findBestTimetable(timetableConstraints);

    // request doAuto
    // return this.autotimetablerClient.findBestTimetable({
    //   // TODO fill in the request data
    //   start: 0,
    //   end: 0,
    //   days: constraints.selectedDaysStr,
    //   gap: constraints.breaksBetweenClasses,
    //   maxdays: constraints.daysAtUni,
    //   periodInfo: [],
    // });
  }
}
