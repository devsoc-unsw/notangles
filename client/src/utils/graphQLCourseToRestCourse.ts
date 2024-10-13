import { DbCourse } from '../interfaces/Database';
import { QueryResponse } from '../interfaces/GraphQL';
import { Status } from '../interfaces/Periods';

const statusMapping: Record<string, Status> = {
  open: 'Open',
  full: 'Full',
  'on hold': 'On Hold',
};

const getStatus = (status: string): Status => {
  return statusMapping[status.toLowerCase()] || 'Open';
};

export const convertGraphQLCourseToRestCourse = (queryResponse: QueryResponse): DbCourse[] => {
  return queryResponse.data.courses.map((course) => ({
    courseCode: course.course_code,
    name: course.course_name,
    classes: course.classes.map((classItem) => ({
      section: classItem.section,
      activity: classItem.activity,
      status: getStatus(classItem.status),
      courseEnrolment: {
        enrolments: parseInt(classItem.course_enrolment.split('/')[0].trim()),
        capacity: parseInt(classItem.course_enrolment.split('/')[1].trim()),
      },
      times: classItem.times.map((time) => ({
        day: time.day,
        time: {
          start: time.time.split('-')[0].trim(),
          end: time.time.split('-')[1]?.trim() || '',
        },
        weeks: time.weeks,
        location: time.location,
      })),
    })),
  }));
};
