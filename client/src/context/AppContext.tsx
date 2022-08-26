import React, { createContext, useState } from 'react';
import { defaultEndTime, defaultStartTime } from '../constants/timetable';
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
}

export const AppContext: any = createContext<IAppContext>({
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

  earliestStartTime: defaultStartTime,
  setEarliestStartTime: () => {},

  latestEndTime: defaultEndTime,
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
});

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  let termData = {
    year: '',
    term: '',
    termNumber: '',
    termName: '',
    firstDayOfTerm: '',
  };
  if (storage.get('termData')) {
    // termData = JSON.parse(storage.get('termData')!);
    termData = storage.get('termData');
  }
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isShowOnlyOpenClasses, setisShowOnlyOpenClasses] = useState<boolean>(storage.get('isShowOnlyOpenClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [isHideExamClasses, setIsHideExamClasses] = useState<boolean>(storage.get('isHideExamClasses'));
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [autoVisibility, setAutoVisibility] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [days, setDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [termNumber, setTermNumber] = useState<number>(Number(termData.termNumber));
  const [term, setTerm] = useState<string>(termData.term);
  const [termName, setTermName] = useState<string>(termData.termName);
  const [year, setYear] = useState<string>(termData.year);
  const [firstDayOfTerm, setFirstDayOfTerm] = useState<string>(termData.firstDayOfTerm);
  const [earliestStartTime, setEarliestStartTime] = useState(9);
  const [latestEndTime, setLatestEndTime] = useState(18);
  
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
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
