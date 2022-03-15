import React, { createContext, useState } from 'react';
import { isPreview } from './constants/timetable';
import { CourseData, SelectedClasses } from './interfaces/Course';
import { AppContextProviderProps } from './PropTypes';
import storage from './utils/storage';

export interface IAppContext {
  selectedCourses: CourseData[];
  setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

  selectedClasses: SelectedClasses;
  setSelectedClasses(newSelectedClasses: SelectedClasses): void;
  setSelectedClasses(callback: (oldSelectedClasses: SelectedClasses) => SelectedClasses): void;

  is12HourMode: boolean;
  setIs12HourMode: (newIs12HourMode: boolean) => void;

  isDarkMode: boolean;
  setIsDarkMode: (newIsDarkMode: boolean) => void;

  isSquareEdges: boolean;
  setIsSquareEdges: (newIsSquareEdges: boolean) => void;

  isHideFullClasses: boolean;
  setIsHideFullClasses: (newIsHideFullClasses: boolean) => void;

  isDefaultUnscheduled: boolean;
  setIsDefaultUnscheduled: (newIsDefaultUnscheduled: boolean) => void;

  isHideClassInfo: boolean;
  setIsHideClassInfo: (newIsHideClassInfo: boolean) => void;

  errorMsg: string;
  setErrorMsg: (newErrorMsg: string) => void;

  errorVisibility: boolean;
  setErrorVisibility: (newErrorVisibility: boolean) => void;

  infoVisibility: boolean;
  setInfoVisibility: (newInfoVisibility: boolean) => void;

  isFriendsListOpen: boolean;
  setIsFriendsListOpen: (newIsFriendListOpen: boolean) => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (newIsLoggedIn: boolean) => void;

  lastUpdated: number;
  setLastUpdated: (newLastUpdated: number) => void;
}

export const AppContext = createContext<IAppContext>({
  selectedCourses: [],
  setSelectedCourses: () => {},

  selectedClasses: {},
  setSelectedClasses: () => {},

  is12HourMode: false,
  setIs12HourMode: () => {},

  isDarkMode: false,
  setIsDarkMode: () => {},

  isSquareEdges: false,
  setIsSquareEdges: () => {},

  isHideFullClasses: false,
  setIsHideFullClasses: () => {},

  isDefaultUnscheduled: false,
  setIsDefaultUnscheduled: () => {},

  isHideClassInfo: false,
  setIsHideClassInfo: () => {},

  errorMsg: '',
  setErrorMsg: () => {},

  errorVisibility: false,
  setErrorVisibility: () => {},

  infoVisibility: false,
  setInfoVisibility: () => {},

  isFriendsListOpen: isPreview,
  setIsFriendsListOpen: () => {},

  isLoggedIn: false,
  setIsLoggedIn: () => {},

  lastUpdated: 0,
  setLastUpdated: () => {},
});

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isHideFullClasses, setIsHideFullClasses] = useState<boolean>(storage.get('isHideFullClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(isPreview);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  const initialContext: IAppContext = {
    selectedCourses,
    setSelectedCourses,
    selectedClasses,
    setSelectedClasses,
    is12HourMode,
    setIs12HourMode,
    isDarkMode,
    setIsDarkMode,
    isSquareEdges,
    setIsSquareEdges,
    isHideFullClasses,
    setIsHideFullClasses,
    isDefaultUnscheduled,
    setIsDefaultUnscheduled,
    isHideClassInfo,
    setIsHideClassInfo,
    errorMsg,
    setErrorMsg,
    errorVisibility,
    setErrorVisibility,
    infoVisibility,
    setInfoVisibility,
    isFriendsListOpen,
    setIsFriendsListOpen,
    isLoggedIn,
    setIsLoggedIn,
    lastUpdated,
    setLastUpdated,
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
