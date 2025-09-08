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
  query GetAvailableTerms {
    classes(
      where: {term: {_in: ["T1", "T2", "T3", "U1"]}}
      distinct_on: offering_period
    ) {
      term
      year
    }
  }
`);
