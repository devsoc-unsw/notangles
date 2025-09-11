import { gql, TypedDocumentNode } from '@apollo/client';
import { useQuery, useSuspenseQuery } from '@apollo/client/react';

import { ClassData, GQLCourseOverview, Status } from '../../interfaces/Periods';

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

const GET_DISTINCT_ACTIVITIES_FOR_COURSE: TypedDocumentNode<
  { classes: { activity: string; course_id: string }[] },
  { courseIds: string[]; term: string }
> = gql`
  query GetDistinctActivitiesForCourse($courseIds: [String!]!, $term: String!) {
    classes(where: { course_id: { _in: $courseIds }, term: { _ilike: $term } }, distinct_on: [activity, course_id]) {
      activity
      course_id
    }
  }
`;

export const useGetDistinctActivitiesForCourse = (courseIds: string[], term: string) => {
  const allActivities = new Map<string, Set<string>>();
  const { data, loading } = useQuery(GET_DISTINCT_ACTIVITIES_FOR_COURSE, {
    variables: { courseIds, term: `%${term}%` },
  });
  if (!loading && data) {
    data.classes.forEach((cls) => {
      if (!allActivities.has(cls.course_id)) {
        allActivities.set(cls.course_id, new Set());
      }
      allActivities.get(cls.course_id)?.add(cls.activity);
    });
  }
  return allActivities;
};

const GET_CLASSES: TypedDocumentNode<
  { classes: { course_id: string; activity: string }[] },
  { classIds: string[]; term: string }
> = gql`
  query GetClasses($classIds: [String!]!, $term: String!) {
    classes(where: { class_id: { _in: $classIds }, term: { _ilike: $term } }) {
      course_id
      activity
    }
  }
`;

export const useGetClassesActivityByClassIds = (classIds: string[], term: string) => {
  const selectedActivities = new Map<string, string>();
  const { data, loading } = useQuery(GET_CLASSES, { variables: { classIds, term: `%${term}%` } });
  if (!loading && data) {
    data.classes.forEach((cls) => {
      selectedActivities.set(cls.course_id, cls.activity);
    });
    return selectedActivities;
  }
};

const GET_CLASS_DATA_FROM_COURSE_ID: TypedDocumentNode<
  {
    classes: {
      id: string;
      classNo: string;
      activity: string;
      status: Status;
      enrolments: string;
      capacity: string;
      section: string;
      term: string;
      year: string;
      course: { course_code: string; course_name: string };
    }[];
  },
  { courseId: string; term: string }
> = gql`
  query GetClassDataFromCourseId($courseId: String!, $term: String!) {
    classes(where: { course_id: { _eq: $courseId }, term: { _ilike: $term } }) {
      id: class_id
      classNo: class_id
      activity
      status
      enrolments: course_enrolment
      capacity: course_enrolment
      section
      term
      year
      course {
        course_code
        course_name
      }
    }
  }
`;

export const useGetCourseDataFromCourseId = (courseId: string, term: string, class_id: string) => {
  const { data, loading } = useQuery(GET_CLASS_DATA_FROM_COURSE_ID, {
    variables: { courseId, term: `%${term}%` },
  });
  if (!loading && data) {
    console.log('Course Data', data);
    const activities: Record<string, ClassData[]> = {};
    data.classes.forEach((cls) => {
      activities[cls.activity].push({
        id: cls.id,
        classNo: cls.classNo,
        courseCode: cls.course.course_code,
        courseName: cls.course.course_name,
        activity: cls.activity,
        status: cls.status,
        enrolments: parseInt(cls.enrolments.split('/')[0]),
        capacity: parseInt(cls.capacity.split('/')[1]),
        periods: [],
        section: cls.section,
        term: cls.term,
        year: cls.year,
      });
    });

    return {
      code: '',
      name: '',
      earliestStartTime: 24,
      latestFinishTime: 0,
      activities: {},
      inventoryData: {},
    };
  }
};
