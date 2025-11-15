import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { TimetableService } from 'src/timetable/timetable.service';
import { AutoTimetableResult, ConstraintDTO, DAYS_OF_WEEK } from './types';
import {
  AUTOTIMETABLER_PACKAGE_NAME,
  AutoTimetablerClient,
  TimetableConstraints,
  TimetableConstraints_PeriodInfo,
} from './proto/autotimetabler';
import { lastValueFrom } from 'rxjs';

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
    let eventIds: string[] = [];
    let term: string;
    try {
      const courses = await this.prisma.timetable.findUniqueOrThrow({
        where: { id: timetableId, userId: userId },
        select: {
          term: true,
          courses: { select: { courseId: true } },
          events: { select: { id: true } },
        },
      });
      courseIds = courses.courses.map((course) => course.courseId);
      eventIds = courses.events.map((event) => event.id);
      term = courses.term;
    } catch {
      throw new Error('Timetable not found');
    }

    // call the prisma to get time of the events
    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { dayOfWeek: true, start: true, end: true },
    });
    console.log(`Fetched ${events.length} events for timetable ${timetableId}`);
    // format the events as single-period classes with a sole time slot
    const eventPeriodInfos: TimetableConstraints_PeriodInfo[] = events.map(
      (event) => {
        const duration = event.end - event.start;
        return {
          periodsPerClass: 1,
          durations: [duration],
          periodTimes: [event.dayOfWeek, event.start],
        };
      },
    );

    // call the graphql to get all the classes on each course
    // There are three modes: in person, online, hybrid, need to filter classes accordingly
    const classes = await this.graphqlService.getAllClassesFromCourses(
      courseIds,
      constraints.mode,
      term,
    );
    console.log(
      `Fetched ${classes.length} classes for courses: ${courseIds.join(', ')}`,
    );

    // filter out classes that are already selected in the timetable
    // const selectedClasses = await this.prisma.course.findMany({
    //   where: { timetableId: timetableId },
    //   select: { selectedClasses: true, courseId: true },
    // });
    // const selectedClassIds = new Set<string>();
    // for (const course of selectedClasses) {
    //   for (const selectedClass of course.selectedClasses) {
    //     selectedClassIds.add(selectedClass);
    //   }
    // }
    // classes = classes.filter((cls) => !selectedClassIds.has(cls.class_id));

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
    const periodOrder: string[] = [];
    const periodInfos: TimetableConstraints_PeriodInfo[] = Object.keys(
      classesByCourseAndActivity,
    ).flatMap((courseId: string) =>
      Object.keys(classesByCourseAndActivity[courseId]).map((activity) => {
        const activityClasses = classesByCourseAndActivity[courseId][activity];
        periodOrder.push(`${courseId}:${activity}`);
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
                const dayOfWeek = DAYS_OF_WEEK.indexOf(t.day) + 1;
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

    // combine eventPeriodInfos with periodInfos
    periodInfos.push(...eventPeriodInfos);
    periodOrder.push(...eventPeriodInfos.map(() => 'event'));

    const timetableConstraints: TimetableConstraints = {
      start: constraints.startHour,
      end: constraints.endHour,
      days: constraints.selectedDaysStr,
      gap: constraints.breaksBetweenClasses,
      maxdays: constraints.daysAtUni,
      periodInfo: periodInfos,
    };

    console.log(`periodInfos: ${JSON.stringify(periodInfos)}`);

    const result = await lastValueFrom(
      this.autotimetablerClient.findBestTimetable(timetableConstraints),
    );

    return {
      result: result,
      classes: classes,
      order: periodOrder,
    };
  }

  async addTimetableToPrisma(
    autoTimetableResponse: AutoTimetableResult,
    timetableId: string,
    userId: string,
  ) {
    const { result, classes, order } = autoTimetableResponse;

    if (!result || !result.times || result.times.length === 0) {
      throw new HttpException(
        'No timetable could be generated with the given constraints',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(
      `Here is the response details:\n ${JSON.stringify(result)}\n ${JSON.stringify(classes)}\n ${JSON.stringify(order)}`,
    );
    const timetableTimes = result.times;

    // Map the generated times back to class IDs
    // Formula to decode the times:  const [day, start] = [Math.floor(timeAsNum / 100), (timeAsNum % 100) / 2];
    const updatePromises = timetableTimes.map(async (timeAsNum, index) => {
      if (order[index] === 'event') {
        // skip event periods
        return;
      }
      const [day, start] = [Math.floor(timeAsNum / 100), (timeAsNum % 100) / 2];
      const matchedClass = classes.find(
        (cls) =>
          cls.course_id === order[index].split(':')[0] &&
          cls.activity === order[index].split(':')[1] &&
          cls.times.some((t) => {
            const dayOfWeek = DAYS_OF_WEEK.indexOf(t.day) + 1;
            const [startStr] = t.time.split(' - ');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const classStart = startHour + startMinute / 60;
            return dayOfWeek === day && classStart === start;
          }),
      );
      if (matchedClass) {
        const courseId = matchedClass.course_id;
        try {
          console.log(
            `Updating timetable ${timetableId} for user ${userId} with class ${matchedClass.class_id} for course ${courseId}`,
          );
          await this.timetableService.updateSelectedClass(
            userId,
            timetableId,
            courseId,
            matchedClass.class_id,
          );
        } catch (error) {
          throw new HttpException(
            `Failed to update timetable with class ${matchedClass.class_id} for course ${courseId}: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        console.log(`No Matched class found for time ${timeAsNum}`);
      }
    });
    await Promise.all(updatePromises);
    return HttpStatus.OK;
  }
}
