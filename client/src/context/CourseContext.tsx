import { createContext, useMemo, useState } from 'react';

import { CourseData, CreatedEvents, EventPeriod, SelectedClasses } from '../interfaces/Periods';
import { CourseContextProviderProps } from '../interfaces/PropTypes';

export interface ICourseContext {
  selectedCourses: CourseData[];
  setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

  selectedClasses: SelectedClasses;
  setSelectedClasses(newSelectedClasses: SelectedClasses): void;
  setSelectedClasses(callback: (oldSelectedClasses: SelectedClasses) => SelectedClasses): void;

  createdEvents: CreatedEvents;
  setCreatedEvents: (newCreatedEvents: CreatedEvents) => void;

  assignedColors: Record<string, string>;
  setAssignedColors(newAssignedColours: Record<string, string>): void;
  setAssignedColors(callback: (newAssignedColours: Record<string, string>) => Record<string, string>): void;

  copiedEvent: EventPeriod | null;
  setCopiedEvent: (newCopiedEvent: EventPeriod | null) => void;
}

export const CourseContext = createContext<ICourseContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  selectedClasses: {},
  setSelectedClasses: () => {},

  createdEvents: {},
  setCreatedEvents: () => {},

  assignedColors: {},
  setAssignedColors: () => {},

  copiedEvent: null,
  setCopiedEvent: () => {},
});

const CourseContextProvider = ({ children }: CourseContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [createdEvents, setCreatedEvents] = useState<CreatedEvents>({});
  const [assignedColors, setAssignedColors] = useState<Record<string, string>>({});
  const [copiedEvent, setCopiedEvent] = useState<EventPeriod | null>(null);

  const initialContext = useMemo(
    () => ({
      selectedCourses,
      setSelectedCourses,
      selectedClasses,
      setSelectedClasses,
      createdEvents,
      setCreatedEvents,
      assignedColors,
      setAssignedColors,
      copiedEvent,
      setCopiedEvent,
    }),
    [selectedCourses, selectedClasses, createdEvents, assignedColors, copiedEvent],
  );

  return <CourseContext.Provider value={initialContext}>{children}</CourseContext.Provider>;
};

export default CourseContextProvider;
