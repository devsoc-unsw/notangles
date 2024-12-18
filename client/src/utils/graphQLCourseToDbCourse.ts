import { DbCourse } from '../interfaces/Database';
import { GraphQLCourse } from '../interfaces/GraphQLCourseInfo';
import { Status } from '../interfaces/Periods';

const statusMapping: Record<string, Status> = {
  open: 'Open',
  full: 'Full',
  'on hold': 'On Hold',
};

/**
 * An adapter that formats a GraphQLCourse object to a DBCourse object
 *
 * @param graphQLCourse A GraphQLCourse object
 * @return A DBCourse object
 *
 * @example
 * const data = await client.query({query: GET_COURSE_INFO, variables: { courseCode, term }});
 * const json: DbCourse = graphQLCourseToDbCourse(data);
 */
export const graphQLCourseToDbCourse = (graphQLCourse: GraphQLCourse): DbCourse => {
  const course = graphQLCourse.data.courses[0];

  return {
    courseCode: course.course_code,
    name: course.course_name,
    classes: course.classes.map((classItem) => ({
      section: classItem.section,
      activity: classItem.activity,
      status: statusMapping[classItem.status.toLowerCase()] || 'Open',
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
