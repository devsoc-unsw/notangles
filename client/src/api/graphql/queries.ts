import { gql, TypedDocumentNode } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';

import { GQLCourseOverview } from '../../interfaces/Periods';

interface CoursesQueryResponse {
  courses: GQLCourseOverview[];
}
interface CoursesQueryVars {
  term: string;
}

const GET_COURSES: TypedDocumentNode<CoursesQueryResponse, CoursesQueryVars> = gql`
  query GetCourses($term: String!) {
    courses(where: { terms: { _ilike: $term } }) {
      id: course_id
      code: course_code
      name: course_name
      career
      modes
      faculty
    }
  }
`;

export const useGetCoursesByTermAndFaculty = (term: string) => {
  const termWithWildcard = `%${term}%`;
  const { data } = useSuspenseQuery(GET_COURSES, { variables: { term: termWithWildcard } });

  return data.courses.map((course) => ({
    ...course,
    inPerson: course.modes.includes('In Person'),
    online: course.modes.includes('Online'),
  }));
};
