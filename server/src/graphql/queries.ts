import { gql } from 'graphql-tag';

export const COURSE_EXISTS = gql(`
  query CourseExists($courseId: String!, $term: String!) {
    courseExists: classes_aggregate(
      where: { course_id: { _eq: $courseId }, term: { _eq: $term } }
    ) {
      aggregate {
        count
      }
    }
  }
`);

export const CLASS_DETAILS = gql(`
  query ClassDetails($classId: String!) {
  classDetails: classes_by_pk(class_id: $classId) {
    activity
    career
    course_enrolment
    mode
    offering_period
    section
    status
    term
    times {
      day
      location
      time
      weeks
    }
    year
  }
}
`);
