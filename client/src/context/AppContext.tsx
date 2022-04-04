import React, { createContext, useState } from 'react';
import { isPreview } from '../constants/timetable';
import { AppContextProviderProps } from '../interfaces/PropTypes';
import storage from '../utils/storage';

export interface IAppContext {
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

  isSortAlphabetic: boolean;
  setIsSortAlphabetic: (newIsSortAlphabetic: boolean) => void;

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

  isDrag: boolean;
  setIsDrag: (newIsDrag: boolean) => void;

  days: string[];
  setDays: (newDays: string[]) => void;
}

export const AppContext = createContext<IAppContext>({
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

  isSortAlphabetic: false,
  setIsSortAlphabetic: () => {},

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

  isDrag: false,
  setIsDrag: () => {},

  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  setDays: () => {},
});

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isHideFullClasses, setIsHideFullClasses] = useState<boolean>(storage.get('isHideFullClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [isSortAlphabetic, setIsSortAlphabetic] = useState<boolean>(storage.get('isSortAlphabetic'));
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(isPreview);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [days, setDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const initialContext: IAppContext = {
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
    isSortAlphabetic,
    setIsSortAlphabetic,
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
    isDrag,
    setIsDrag,
    days,
    setDays,
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
