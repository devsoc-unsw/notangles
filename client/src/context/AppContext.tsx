import { createContext, useState } from 'react';

import { getDefaultEndTime, getDefaultStartTime } from '../constants/timetable';
import { CoursesList } from '../interfaces/Courses';
import { CourseDataMap, DisplayTimetablesMap, Term, TermDataList } from '../interfaces/Periods';
import { AppContextProviderProps } from '../interfaces/PropTypes';
import storage from '../utils/storage';

export interface IAppContext {
  alertMsg: string;
  setAlertMsg: (newErrorMsg: string) => void;

  alertFunction: () => void;
  setAlertFunction: (newAlertFunction: () => void) => void;

  errorVisibility: boolean;
  setErrorVisibility: (newErrorVisibility: boolean) => void;

  infoVisibility: boolean;
  setInfoVisibility: (newInfoVisibility: boolean) => void;

  autoVisibility: boolean;
  setAutoVisibility: (newAutoVisibility: boolean) => void;

  isDrag: boolean;
  setIsDrag: (newIsDrag: boolean) => void;

  days: string[];
  setDays(newDays: string[]): void;
  setDays(callback: (oldDays: string[]) => string[]): void;

  earliestStartTime: number;
  setEarliestStartTime(newEarliestStartTime: number): void;
  setEarliestStartTime(callback: (oldEarliestStartTime: number) => number): void;

  latestEndTime: number;
  setLatestEndTime(newLatestEndTime: number): void;
  setLatestEndTime(callback: (oldLatestEndTime: number) => number): void;

  term: Term;
  setTerm: (newTerm: Term) => void;

  termName: string;
  setTermName: (newTermName: string) => void;

  termsData: TermDataList;
  setTermsData: (newTermData: TermDataList) => void;

  termNumber: number;
  setTermNumber: (newTermNumber: number) => void;

  year: string;
  setYear: (newYear: string) => void;

  firstDayOfTerm: string;
  setFirstDayOfTerm: (newFirstDayOfTerm: string) => void;

  coursesList: CoursesList;
  setCoursesList: (newCoursesList: CoursesList) => void;

  selectedTimetable: number;
  setSelectedTimetable: (newSelectedTimetable: number) => void;

  displayTimetables: DisplayTimetablesMap;
  setDisplayTimetables: (newDisplayTimetable: any) => void;

  courseData: CourseDataMap;
  setCourseData: (newCourseData: CourseDataMap) => void;
}

export const AppContext = createContext<IAppContext>({
  alertMsg: '',
  setAlertMsg: () => {},

  alertFunction: () => {},
  setAlertFunction: () => {},

  errorVisibility: false,
  setErrorVisibility: () => {},

  infoVisibility: false,
  setInfoVisibility: () => {},

  autoVisibility: false,
  setAutoVisibility: () => {},

  isDrag: false,
  setIsDrag: () => {},

  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  setDays: () => {},

  earliestStartTime: getDefaultStartTime(true),
  setEarliestStartTime: () => {},

  latestEndTime: getDefaultEndTime(true),
  setLatestEndTime: () => {},

  term: '',
  setTerm: () => {},

  termName: ``,
  setTermName: () => {},

  termsData: [],
  setTermsData: () => {},

  termNumber: 0,
  setTermNumber: () => {},

  year: '',
  setYear: () => {},

  firstDayOfTerm: '',
  setFirstDayOfTerm: () => {},

  coursesList: [],
  setCoursesList: () => {},

  selectedTimetable: 0,
  setSelectedTimetable: () => {},

  displayTimetables: {},
  setDisplayTimetables: () => {},

  courseData: { map: [] },
  setCourseData: () => {},
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
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [isHideExamClasses, setIsHideExamClasses] = useState<boolean>(storage.get('isHideExamClasses'));
  const [isConvertToLocalTimezone, setIsConvertToLocalTimezone] = useState<boolean>(
    storage.get('isConvertToLocalTimezone'),
  );
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [alertFunction, setAlertFunction] = useState<() => void>(() => () => {});
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [autoVisibility, setAutoVisibility] = useState<boolean>(false);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [earliestStartTime, setEarliestStartTime] = useState(getDefaultStartTime(isConvertToLocalTimezone));
  const [latestEndTime, setLatestEndTime] = useState(getDefaultEndTime(isConvertToLocalTimezone));
  const [termNumber, setTermNumber] = useState<number>(Number(termData.termNumber) || 0);
  const [term, setTerm] = useState<Term>(termData.term);
  const [termName, setTermName] = useState<string>('');
  const [year, setYear] = useState<string>(termData.year || '');
  const [termsData, setTermsData] = useState<TermDataList>([]);
  const [firstDayOfTerm, setFirstDayOfTerm] = useState<string>(termData.firstDayOfTerm || ``);
  const [coursesList, setCoursesList] = useState<CoursesList>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<number>(0);
  const [displayTimetables, setDisplayTimetables] = useState<DisplayTimetablesMap>({});
  const [courseData, setCourseData] = useState<CourseDataMap>({ map: [] });

  const initialContext: IAppContext = {
    alertMsg,
    setAlertMsg,
    alertFunction,
    setAlertFunction,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    autoVisibility,
    setAutoVisibility,
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
    termsData,
    setTermsData,
    termNumber,
    setTermNumber,
    year,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    coursesList,
    setCoursesList,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
    courseData,
    setCourseData,
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
