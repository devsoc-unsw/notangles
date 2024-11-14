import { Injectable } from '@nestjs/common';
import { GQLCourseData } from './graphql.response';
const HASURAGRES_GRAPHQL_API = 'https://graphql.csesoc.app/v1/graphql';

export const GET_COURSE_INFO = `
  query GetCourseInfo($courseCode: String!, $term: String!, $year: String!) {
    courses(where: { course_code: { _eq: $courseCode } }) {
      course_code
      course_name
      classes(
        where: {
          term: { _eq: $term }
          year: { _eq: $year }
          activity: { _neq: "Course Enrolment" }
        }
      ) {
        activity
        status
        course_enrolment
        class_id
        term
        section
        times {
          day
          time
          weeks
          location
        }
        consent
        mode
        class_notes
      }
    }
  }
`;

@Injectable()
export class GraphqlService {
  async fetchData(
    query: string,
    variables?: Record<string, any>,
  ): Promise<GQLCourseData> {
    try {
      const data = await fetch(HASURAGRES_GRAPHQL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
      return data.json();
    } catch (error) {
      console.error('GraphQL Request Error:', error);
      throw error;
    }
  }
  async fetchCourseData(
    courseCode: string,
    term: string,
    year: string,
  ): Promise<GQLCourseData> {
    return this.fetchData(GET_COURSE_INFO, { courseCode, term, year });
  }
}
