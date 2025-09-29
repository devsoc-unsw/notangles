import { gql, TypedDocumentNode } from '@apollo/client';
import { useQuery, useSuspenseQuery } from '@apollo/client/react';

import { GQLClassData, GQLCourseOverview } from '../../interfaces/Timetable';

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
    classes(
      where: { course_id: { _in: $courseIds }, term: { _ilike: $term }, activity: { _neq: "Course Enrolment" } }
      distinct_on: [activity, course_id]
    ) {
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

const GET_CLASS_DATA_FROM_COURSE_IDS: TypedDocumentNode<
  {
    classes: GQLClassData[];
  },
  { courseIds: string[]; term: string }
> = gql`
  query GetClassDataFromCourseId($courseIds: [String!]!, $term: String!) {
    classes(
      where: { course_id: { _in: $courseIds }, term: { _ilike: $term }, activity: { _neq: "Course Enrolment" } }
    ) {
      id: class_id
      activity
      status
      enrolments: course_enrolment
      section
      term
      year
      course {
        course_id
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
`;

export const useGetAllClassesFromCourseIds = ($courseIds: string[], term: string) => {
  const { data, loading } = useQuery(GET_CLASS_DATA_FROM_COURSE_IDS, {
    variables: { courseIds: $courseIds, term: `%${term}%` },
  });
  if (loading || !data) return [];

  return data.classes;

  // const coursesActivities: CourseActivities = {};
  // for (const courseId of $courseIds) {
  //   coursesActivities[courseId] = {};
  // }
  // if (!loading && data) {
  //   data.classes.forEach((cls) => {
  //     const classData: ClassData = {
  //       id: cls.id,
  //       classNo: cls.classNo,
  //       courseCode: cls.course.course_code,
  //       courseName: cls.course.course_name,
  //       section: cls.section,
  //       activity: cls.activity,
  //       subActivity: undefined, // TODO: Identify sub-activities completed courseActivities
  //       status: cls.status,
  //       enrolments: parseInt(cls.enrolments.split('/')[0]),
  //       capacity: parseInt(cls.capacity.split('/')[1]),
  //       location: cls.times.location,
  //       times: {
  //         day: parseDay(cls.times.day),
  //         start: parseTime(cls.times.time.split('-')[0]),
  //         end: parseTime(cls.times.time.split('-')[1]),
  //         weeks: parseWeeks(cls.times.weeks),
  //       },
  //       term: cls.term,
  //       year: cls.year,
  //     };
  //     if (!(cls.activity in coursesActivities[cls.course.course_id])) {
  //       coursesActivities[cls.course.course_id][cls.activity] = [];
  //     }
  //     coursesActivities[cls.course.course_id][cls.activity].push(classData);
  //   });
  // }

  // return coursesActivities;
};
