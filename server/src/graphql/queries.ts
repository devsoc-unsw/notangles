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
      section
    }
  }
`);

export const GET_AVAILABLE_TERMS = gql(`
  query GetAvailableTerms($currentYear: Int!) {
    classes(
      where: {term: {_in: ["T1", "T2", "T3", "U1"]}, year: {_gte: $currentYear}}
      distinct_on: offering_period
    ) {
      term
      year
    }
  }
`);

export const GET_ALL_CLASSES_FROM_COURSES = gql(`
  query GetAllClassesFromCourses($courseIds: [String!]!, $mode :String!, $term: String!) {
    classes(
      where: { course_id: { _in: $courseIds }, term: { _ilike: $term }, mode: { _neq: $mode }, activity: { _neq: "Course Enrolment" } }
    ) {
      course_id
      class_id
      activity
      times {
        day
        time
      }
    }
  }
`);
