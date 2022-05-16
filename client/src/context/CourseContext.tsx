import React, { createContext, useMemo, useState } from 'react';
import { CourseData, SelectedClasses, SelectedEvents } from '../interfaces/Course';
import { CourseContextProviderProps } from '../interfaces/PropTypes';

export interface ICourseContext {
  selectedCourses: CourseData[];
  setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

  selectedClasses: SelectedClasses;
  setSelectedClasses(newSelectedClasses: SelectedClasses): void;
  setSelectedClasses(callback: (oldSelectedClasses: SelectedClasses) => SelectedClasses): void;

  selectedEvents: SelectedEvents; 
  setSelectedEvents(newSelectedEvents: SelectedEvents): void;

}

export const CourseContext = createContext<ICourseContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  selectedClasses: {},
  setSelectedClasses: () => {},

  selectedEvents: {},
  setSelectedEvents: () => {},
});

const CourseContextProvider = ({ children }: CourseContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvents>({});
  const initialContext = useMemo(
    () => ({
      selectedCourses,
      setSelectedCourses,
      selectedClasses,
      setSelectedClasses,
      selectedEvents,
      setSelectedEvents,
    }),
    [selectedCourses, selectedClasses, selectedEvents]
  );

  return <CourseContext.Provider value={initialContext}>{children}</CourseContext.Provider>;
};

export default CourseContextProvider;
