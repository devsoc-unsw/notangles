import React, { createContext, useState } from 'react';

import { getDefaultStartTime, getDefaultEndTime } from '../constants/timetable';
import { CoursesList } from '../interfaces/Courses';
import { AppContextProviderProps } from '../interfaces/PropTypes';
import storage from '../utils/storage';

export interface IAppContext {
  is12HourMode: boolean;
  setIs12HourMode: (newIs12HourMode: boolean) => void;

  isDarkMode: boolean;
  setIsDarkMode: (newIsDarkMode: boolean) => void;

  isSquareEdges: boolean;
  setIsSquareEdges: (newIsSquareEdges: boolean) => void;

  isShowOnlyOpenClasses: boolean;
  setisShowOnlyOpenClasses: (newisShowOnlyOpenClasses: boolean) => void;

  isDefaultUnscheduled: boolean;
  setIsDefaultUnscheduled: (newIsDefaultUnscheduled: boolean) => void;

  isHideClassInfo: boolean;
  setIsHideClassInfo: (newIsHideClassInfo: boolean) => void;

  isHideExamClasses: boolean;
  setIsHideExamClasses: (newIsHideExamClasses: boolean) => void;

  isConvertToLocalTimezone: boolean;
  setIsConvertToLocalTimezone: (newIsConvertToLocalTimezone: boolean) => void;

  alertMsg: string;
  setAlertMsg: (newErrorMsg: string) => void;

  errorVisibility: boolean;
  setErrorVisibility: (newErrorVisibility: boolean) => void;

  infoVisibility: boolean;
  setInfoVisibility: (newInfoVisibility: boolean) => void;

  autoVisibility: boolean;
  setAutoVisibility: (newAutoVisibility: boolean) => void;

  lastUpdated: number;
  setLastUpdated: (newLastUpdated: number) => void;

  isDrag: boolean;
  setIsDrag: (newIsDrag: boolean) => void;

  days: string[];
  setDays(newDays: string[]): void;
  setDays(callback: (oldDays: string[]) => string[]): void;

  earliestStartTime: number;
  setEarliestStartTime: (newEarliestStartTime: number) => void;

  latestEndTime: number;
  setLatestEndTime: (newLatestEndTime: number) => void;

  term: string;
  setTerm: (newTerm: string) => void;

  termName: string;
  setTermName: (newTermName: string) => void;

  termNumber: number;
  setTermNumber: (newTermNumber: number) => void;

  year: string;
  setYear: (newYear: string) => void;

  firstDayOfTerm: string;
  setFirstDayOfTerm: (newFirstDayOfTerm: string) => void;

  coursesList: CoursesList;
  setCoursesList: (newCoursesList: CoursesList) => void;
}

export const AppContext = createContext<IAppContext>({
  is12HourMode: false,
  setIs12HourMode: () => {},

  isDarkMode: false,
  setIsDarkMode: () => {},

  isSquareEdges: false,
  setIsSquareEdges: () => {},

  isShowOnlyOpenClasses: false,
  setisShowOnlyOpenClasses: () => {},

  isDefaultUnscheduled: false,
  setIsDefaultUnscheduled: () => {},

  isHideClassInfo: false,
  setIsHideClassInfo: () => {},

  isHideExamClasses: false,
  setIsHideExamClasses: () => {},

  isConvertToLocalTimezone: true,
  setIsConvertToLocalTimezone: () => {},

  alertMsg: '',
  setAlertMsg: () => {},

  errorVisibility: false,
  setErrorVisibility: () => {},

  infoVisibility: false,
  setInfoVisibility: () => {},

  autoVisibility: false,
  setAutoVisibility: () => {},

  lastUpdated: 0,
  setLastUpdated: () => {},

  isDrag: false,
  setIsDrag: () => {},

  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  setDays: () => {},

  earliestStartTime: getDefaultStartTime(true),
  setEarliestStartTime: () => {},

  latestEndTime: getDefaultEndTime(true),
  setLatestEndTime: () => {},

  term: `T0`,
  setTerm: () => {},

  termName: `Term 0`,
  setTermName: () => {},

  termNumber: 0,
  setTermNumber: () => {},

  year: '0000',
  setYear: () => {},

  firstDayOfTerm: '0000-00-00',
  setFirstDayOfTerm: () => {},

  coursesList: [],
  setCoursesList: () => {},
});

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  let termData = {
    year: '',
    term: '',
    termNumber: '',
    termName: '',
    firstDayOfTerm: '',
  };
  if (localStorage.getItem('termData')) {
    termData = JSON.parse(localStorage.getItem('termData')!);
  }
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isShowOnlyOpenClasses, setisShowOnlyOpenClasses] = useState<boolean>(storage.get('isShowOnlyOpenClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [isHideExamClasses, setIsHideExamClasses] = useState<boolean>(storage.get('isHideExamClasses'));
  const [isConvertToLocalTimezone, setIsConvertToLocalTimezone] = useState<boolean>(storage.get('isConvertToLocalTimezone'));
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [autoVisibility, setAutoVisibility] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [earliestStartTime, setEarliestStartTime] = useState(getDefaultStartTime(isConvertToLocalTimezone));
  const [latestEndTime, setLatestEndTime] = useState(getDefaultEndTime(isConvertToLocalTimezone));
  const [termNumber, setTermNumber] = useState<number>(Number(termData.termNumber) || 0);
  const [term, setTerm] = useState<string>(termData.term || `T0`);
  const [termName, setTermName] = useState<string>(`Term ${termNumber}`);
  const [year, setYear] = useState<string>(termData.year || '0000');
  const [firstDayOfTerm, setFirstDayOfTerm] = useState<string>(termData.firstDayOfTerm || `0000-00-00`);
  const [coursesList, setCoursesList] = useState<CoursesList>([]);
  const initialContext: IAppContext = {
    is12HourMode,
    setIs12HourMode,
    isDarkMode,
    setIsDarkMode,
    isSquareEdges,
    setIsSquareEdges,
    isShowOnlyOpenClasses,
    setisShowOnlyOpenClasses,
    isDefaultUnscheduled,
    setIsDefaultUnscheduled,
    isHideClassInfo,
    setIsHideClassInfo,
    isHideExamClasses,
    setIsHideExamClasses,
    isConvertToLocalTimezone,
    setIsConvertToLocalTimezone,
    alertMsg,
    setAlertMsg,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    autoVisibility,
    setAutoVisibility,
    lastUpdated,
    setLastUpdated,
    isDrag,
    setIsDrag,
    days,
    setDays,
    earliestStartTime,
    setEarliestStartTime,
    latestEndTime,
    setLatestEndTime,
    term,
    setTerm,
    termName,
    setTermName,
    termNumber,
    setTermNumber,
    year,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    coursesList,
    setCoursesList,
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
