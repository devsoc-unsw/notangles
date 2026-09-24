import { DbCourse } from '../interfaces/Database';
import { Course, CoursesData } from '../interfaces/GraphQLCourseInfo';
import { Status } from '../interfaces/Periods';

const statusMapping: Record<string, Status> = {
  open: 'Open',
  full: 'Full',
  'on hold': 'On Hold',
};

/**
 * A filter picking the course with specific career from a list of courses
 *
 * @param courses A list of courses
 * @param career A career to match ("Undergraduate" or "Postgraduate")
 * @return A course matching the career
 */
const pickOffering = (courses: Course[], career: string): Course => {
  const match = courses.find((course) => course.classes.some((classItem) => classItem.class_id.includes(career)));
  if (match) return match;
  else return courses[0];
};

/**
 * An adapter that formats a GraphQLCourse object to a DBCourse object
 *
 * @param CoursesData A GraphQLCourse object
 * @param career A career of the course ("Undergraduate" or "Postgraduate")
 * @return A DBCourse object
 *
 * @example
 * const data = await client.query({query: GET_COURSE_INFO, variables: { courseCode, term }});
 * const json: DbCourse = graphQLCourseToDbCourse(data, 'Undergraduate');
 */
export const graphQLCourseToDbCourse = (graphQLCourse: CoursesData, career?: string): DbCourse => {
  const course = pickOffering(graphQLCourse.courses, career ?? '');

  return {
    courseCode: course.course_code,
    name: course.course_name,
    career: career ?? '',
    classes: course.classes.map((classItem) => ({
      section: classItem.section,
      activity: classItem.activity,
      status: statusMapping[classItem.status.toLowerCase()] ?? 'Open',
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
      term: classItem.term,
      classID: classItem.class_id,
    })),
  };
};
