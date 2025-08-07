import { createContext, useMemo, useState } from 'react';

import { CreatedEvents, SelectedClasses } from '../interfaces/Periods';
import { CourseContextProviderProps } from '../interfaces/PropTypes';

type classId = string;
interface LocalCourse {
  courseId: string;
  selectedClasses: classId[];
  color: string;
}

export interface ICourseContext {
  selectedCourses: LocalCourse[];
  setSelectedCourses: (newSelectedCourses: LocalCourse[]) => void;

  setSelectedClasses: (courseId: string, newSelectedClasses: classId[]) => void;

  createdEvents: CreatedEvents;
  setCreatedEvents: (newCreatedEvents: CreatedEvents) => void;

  setAssignedColor(courseId: string, color: string): void;
}

export const CourseContext = createContext<ICourseContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  setSelectedClasses: () => {},

  createdEvents: {},
  setCreatedEvents: () => {},

  setAssignedColor: () => {},
});

const CourseContextProvider = ({ children }: CourseContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<LocalCourse[]>([]);
  const [createdEvents, setCreatedEvents] = useState<CreatedEvents>({});

  const setSelectedClasses = (courseId: string, newSelectedClasses: classId[]) => {
    setSelectedCourses((prevSelectedCourses) =>
      prevSelectedCourses.map((course) =>
        course.courseId === courseId ? { ...course, selectedClasses: newSelectedClasses } : course,
      ),
    );
  };

  const setAssignedColor = (courseId: string, color: string) => {
    setSelectedCourses((prevSelectedCourses) =>
      prevSelectedCourses.map((course) => (course.courseId === courseId ? { ...course, color } : course)),
    );
  };

  const initialContext = useMemo(
    () => ({
      selectedCourses,
      setSelectedCourses,
      setSelectedClasses,
      createdEvents,
      setCreatedEvents,
      setAssignedColor,
    }),
    [selectedCourses, createdEvents],
  );

  return <CourseContext.Provider value={initialContext}>{children}</CourseContext.Provider>;
};

export default CourseContextProvider;
