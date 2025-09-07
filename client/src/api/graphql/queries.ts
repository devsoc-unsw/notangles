import { gql, TypedDocumentNode } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';

import { GQLCourseOverview } from '../../interfaces/Periods';

interface CoursesQueryResponse {
  courses: GQLCourseOverview[];
}

interface CoursesBoolExp {
  terms?: { _like?: string };
  faculty?: { _in?: string[] };
  _and?: CoursesBoolExp[];
  _or?: CoursesBoolExp[];
}

interface CoursesQueryVars {
  where: CoursesBoolExp;
}

const GET_COURSES: TypedDocumentNode<CoursesQueryResponse, CoursesQueryVars> = gql`
  query GetCourses($where: courses_bool_exp!) {
    courses(where: $where) {
      id: course_id
      code: course_code
      name: course_name
      career
    }
  }
`;

export const useGetCoursesByTermAndFaculty = (term: string, faculties?: string[]) => {
  const where: CoursesBoolExp = {
    terms: { _like: `%${term}%` },
    ...(faculties?.length ? { faculty: { _in: faculties } } : {}),
  };

  const { data } = useSuspenseQuery(GET_COURSES, { variables: { where } });
  return data.courses;
};
