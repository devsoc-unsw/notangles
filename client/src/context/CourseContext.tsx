import React, { createContext, useMemo, useState } from 'react';
import { CourseData, SelectedClasses } from '../interfaces/Course';
import { CourseContextProviderProps } from '../interfaces/PropTypes';

export interface ICourseContext {
  selectedCourses: CourseData[];
  setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

  selectedClasses: SelectedClasses;
  setSelectedClasses(newSelectedClasses: SelectedClasses): void;
  setSelectedClasses(callback: (oldSelectedClasses: SelectedClasses) => SelectedClasses): void;
}

export const CourseContext = createContext<ICourseContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  selectedClasses: {},
  setSelectedClasses: () => {},
});

const CourseContextProvider = ({ children }: CourseContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const initialContext = useMemo(
    () => ({
      selectedCourses,
      setSelectedCourses,
      selectedClasses,
      setSelectedClasses,
    }),
    [selectedCourses, selectedClasses]
  );

  return <CourseContext.Provider value={initialContext}>{children}</CourseContext.Provider>;
};

export default CourseContextProvider;
