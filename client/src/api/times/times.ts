import { gql, TypedDocumentNode } from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';
import { parse } from 'date-fns';

export interface Term {
  year: number;
  term: string;
  name: string;
  termIndex: number;
  startDate: Date;
  endDate: Date;
}

type TermQueryType = TypedDocumentNode<
  {
    classes: { term: string; year: number; offering_period: string }[];
  },
  { years: number[] }
>;

/* 
{
  "term": "T2",
  "year": 2025,
  "offering_period": "02/06/2025 - 31/08/2025"
}
*/
const GET_TERMS_QUERY: TermQueryType = gql`
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
`;

const termNameMap: Record<string, string> = {
  T1: 'Term 1',
  T2: 'Term 2',
  T3: 'Term 3',
  U1: 'Summer Term',
};

const termOrder: Record<string, number> = {
  U1: 0,
  T1: 1,
  T2: 2,
  T3: 3,
};

export function useAvailableTerms(): Term[] {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const { data } = useSuspenseQuery(GET_TERMS_QUERY, {
    variables: { years },
    fetchPolicy: 'no-cache', // TODO: Consider caching
  });

  const terms: Term[] = data.classes.map((c) => ({
    year: c.year,
    term: c.term,
    name: `${termNameMap[c.term]}, ${String(c.year)}`,
    termIndex: termOrder[c.term],
    startDate: parse(c.offering_period.split(' - ')[0], 'dd/MM/yyyy', new Date()),
    endDate: parse(c.offering_period.split(' - ')[1], 'dd/MM/yyyy', new Date()),
  }));

  // Sort by year ascending, then by term order, only keep the final term of last year if we are only one term into the new year
  terms.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.termIndex - b.termIndex;
  });

  // TODO: Can this be improved?
  const currentDate = new Date();
  const currentYearTerms = terms.filter((t) => t.year === currentYear);
  if (currentYearTerms.length > 0) {
    const firstTerm = currentYearTerms[0];
    if (currentDate < firstTerm.startDate) {
      // We are before the first term of the current year, only keep the last term of the previous year
      return terms.filter((t) => t.year < currentYear).slice(-1);
    } else {
      // We are in or after the first term of the current year, keep all terms
      return terms;
    }
  } else {
    // No terms for the current year, return all fetched terms
    return terms;
  }
}

type CoursesInfoQueryType = TypedDocumentNode<
  {
    courses: {
      course_id: string;
      course_name: string;
      course_code: string;
      faculty: string;
      career: string;
      terms: string[];
      modes: ('In Person' | 'Online')[];
    }[];
  },
  { courseIds: string[] }
>;

const COURSES_INFO_QUERY: CoursesInfoQueryType = gql`
  query GetCoursesInfo($courseIds: [String!]!) {
    courses(where: { course_id: { _in: $courseIds } }, order_by: { course_code: asc }) {
      course_id
      course_name
      course_code
      faculty
      career
      terms
      modes
    }
  }
`;

export const useCoursesInfoQuery = (courseIds: string[]) => {
  const skip = courseIds.length === 0;

  const { data } = useSuspenseQuery(COURSES_INFO_QUERY, {
    variables: { courseIds },
    skip,
  });

  // Data should only be undefined if skipped
  if (skip || data === undefined) return [];

  return data.courses;
};

type CoursesClassTimesQueryType = TypedDocumentNode<
  {
    classes: {
      times: {
        day: string;
        time: string;
      }[];
    }[];
  },
  { courseIds: string[]; year: number; term: string }
>;

export const COURSES_CLASS_TIMES_QUERY: CoursesClassTimesQueryType = gql`
  query GetCoursesClassTimes($courseIds: [String!]!, $year: Int!, $term: String!) {
    classes(where: { course_id: { _in: $courseIds }, year: { _eq: $year }, term: { _eq: $term } }) {
      times {
        day
        time
      }
    }
  }
`;

export const useCoursesClassTimesQuery = (courseIds: string[], year: number, term: string) => {
  const skip = courseIds.length === 0;

  const { data } = useSuspenseQuery(COURSES_CLASS_TIMES_QUERY, {
    variables: { courseIds, year, term },
    skip,
  });

  // Data should only be undefined if skipped
  if (skip || data === undefined)
    return [] as {
      times: {
        day: string;
        time: string;
      }[];
    }[];

  return data.classes;
};

type CourseClassTimesDetailedQueryType = TypedDocumentNode<
  {
    classes: {
      times: {
        day: string;
        time: string;
        location: string;
      }[];
      section: string;
      class_id: string;
      activity: string;
    }[];
  },
  { courseId: string; year: number; term: string }
>;

export const COURSE_CLASS_TIMES_DETAILED_QUERY: CourseClassTimesDetailedQueryType = gql`
  query GetCoursesClassTimesDetailed($courseId: String!, $year: Int!, $term: String!) {
    classes(where: { course_id: { _eq: $courseId }, year: { _eq: $year }, term: { _eq: $term } }) {
      times {
        day
        time
        location
      }
      section
      class_id
      activity
    }
  }
`;

export const useCourseClassTimesDetailedQuery = (courseId: string, year: number, term: string) => {
  const skip = courseId.length === 0;

  const { data } = useSuspenseQuery(COURSE_CLASS_TIMES_DETAILED_QUERY, {
    variables: { courseId, year, term },
    skip,
  });

  // Data should only be undefined if skipped
  if (skip || data === undefined)
    return [] as {
      times: {
        day: string;
        time: string;
        location: string;
      }[];
      class_id: string;
      section: string;
      activity: string;
    }[];

  return data.classes;
};

const COURSE_LIST_QUERY: TypedDocumentNode<
  {
    courses: {
      course_id: string;
      course_name: string;
      course_code: string;
      faculty: string;
      career: string;
      terms: string[];
      modes: ('In Person' | 'Online')[];
    }[];
  },
  { year: number }
> = gql`
  query GetCourseList($year: Int!) {
    courses(where: { year: { _eq: $year } }, order_by: { course_code: asc }) {
      course_id
      course_name
      course_code
      faculty
      career
      terms
      modes
    }
  }
`;

export const useCourseListQuery = (term: Term) => {
  const { data } = useSuspenseQuery(COURSE_LIST_QUERY, {
    variables: { year: term.year },
  });

  return data.courses.filter((c) => c.terms.includes(term.term));
};
