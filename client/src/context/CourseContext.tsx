import React, { createContext, useMemo, useState } from 'react';
import { CourseData, SelectedClasses, CreatedEvents } from '../interfaces/Periods';
import { CourseContextProviderProps } from '../interfaces/PropTypes';

export interface ICourseContext {
  selectedCourses: CourseData[];
  setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

  selectedClasses: SelectedClasses;
  setSelectedClasses(newSelectedClasses: SelectedClasses): void;
  setSelectedClasses(callback: (oldSelectedClasses: SelectedClasses) => SelectedClasses): void;

  createdEvents: CreatedEvents;
  setCreatedEvents: (newCreatedEvents: CreatedEvents) => void;
}

export const CourseContext = createContext<ICourseContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  selectedClasses: {},
  setSelectedClasses: () => {},

  createdEvents: {},
  setCreatedEvents: () => {},
});

const CourseContextProvider = ({ children }: CourseContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [createdEvents, setCreatedEvents] = useState<CreatedEvents>({});
  const initialContext = useMemo(
    () => ({
      selectedCourses,
      setSelectedCourses,
      selectedClasses,
      setSelectedClasses,
      createdEvents,
      setCreatedEvents,
    }),
    [selectedCourses, selectedClasses, createdEvents]
  );

  return <CourseContext.Provider value={initialContext}>{children}</CourseContext.Provider>;
};

export default CourseContextProvider;
