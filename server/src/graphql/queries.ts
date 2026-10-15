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
      offering_period
      course {
        course_code
        course_name
      }
      times {
          day
          time
          weeks
          location
        }
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

export const GET_TERMS_QUERY = gql(`
  query GetTerms($years: [Int!]!) {
    classes(
      where: { term: { _in: ["T1", "T2", "T3", "U1"] }, year: { _in: $years } }
      distinct_on: [offering_period, year]
    ) {
      term
      year
      offering_period
    }
  }
`);
