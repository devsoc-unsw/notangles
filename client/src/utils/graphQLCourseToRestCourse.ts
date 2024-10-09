import { QueryResponse } from '../interfaces/GraphQL';
import { Course } from '../interfaces/Rest';

export const convertGraphQLCourseToRestCourse = (queryResponse: QueryResponse): Course[] => {
  return queryResponse.data.courses.map((course) => ({
    courseCode: course.course_code,
    name: course.course_name,
    school: course.school,
    faculty: course.faculty,
    campus: course.campus,
    career: course.career,
    termsOffered: course.terms
      .slice(1, -1)
      .split(',')
      .map((term) => term.trim()),
    censusDates: [], // TODO: Placeholder for census dates
    classes: course.classes.map((classItem) => ({
      classID: classItem.class_id ? parseInt(classItem.class_id.split('-').pop()!, 10) : 0,
      section: classItem.section,
      term: classItem.term,
      activity: classItem.activity,
      status: classItem.status,
      courseEnrolment: {
        enrolments: parseInt(classItem.course_enrolment.split('/')[0].trim()),
        capacity: parseInt(classItem.course_enrolment.split('/')[1].trim()),
      },
      termDates: {
        start: '', // TODO: Placeholder for start date
        end: '', // TODO: Placeholder for end date
      },
      needsConsent: classItem.consent.toLowerCase() === 'yes',
      mode: classItem.course.modes.join(', '),
      times: classItem.times.map((time) => ({
        day: time.day,
        time: {
          start: time.time.split('-')[0].trim(),
          end: time.time.split('-')[1]?.trim() || '',
        },
        weeks: time.weeks,
        location: time.location,
        instructor: time.instructor.replace(/\s+/g, ' ').trim(),
      })),
      notes: [], // TODO: Placeholder for notes
    })),
  }));
};
