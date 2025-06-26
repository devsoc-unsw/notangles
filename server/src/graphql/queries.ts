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
