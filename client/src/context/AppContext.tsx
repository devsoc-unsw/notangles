import React, { createContext, useState } from 'react';
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
});

const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
  const [isHideFullClasses, setIsHideFullClasses] = useState<boolean>(storage.get('isHideFullClasses'));
  const [isDefaultUnscheduled, setIsDefaultUnscheduled] = useState<boolean>(storage.get('isDefaultUnscheduled'));
  const [isHideClassInfo, setIsHideClassInfo] = useState<boolean>(storage.get('isHideClassInfo'));
  const [alertMsg, setAlertMsg] = useState<string>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
  const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
  const [autoVisibility, setAutoVisibility] = React.useState<boolean>(false);
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
  };

  return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
