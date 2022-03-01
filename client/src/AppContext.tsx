import React, { useState, createContext } from 'react';
import { CourseData, SelectedClasses } from './interfaces/Course';
import { isPreview } from './constants/timetable';
import { AppContextProviderProps } from './PropTypes';
import storage from './utils/storage';

export interface IAppContext {

    selectedCourses: CourseData[];
    setSelectedCourses: (newSelectedCourses: CourseData[]) => void;

    selectedClasses: SelectedClasses;
    setSelectedClasses: (newSelectedClasses: SelectedClasses) => void;

    is12HourMode: boolean;
    setIs12HourMode: (newIs12HourMode: boolean) => void;

    isDarkMode: boolean;
    setIsDarkMode: (newIsDarkMode: boolean) => void;

    errorMsg: string;
    setErrorMsg: (newErrorMsg: string) => void;

    infoMsg: string;

    errorVisibility: boolean;
    setErrorVisibility: (newErrorVisibility: boolean) => void;

    infoVisibility: boolean;
    setInfoVisibility: (newInfoVisibility: boolean) => void;

    isFriendsListOpen: boolean;
    setIsFriendsListOpen: (newIsFriendListOpen: boolean) => void;

    isLoggedIn: boolean;
    setIsLoggedIn: (newIsLoggedIn: boolean) => void;

    isSquareEdges: boolean;
    setIsSquareEdges: (newIsSquareEdges: boolean) => void;

    lastUpdated: number;
    setLastUpdated: (newLastUpdated: number) => void;

}

export const AppContext = createContext<IAppContext>({

    selectedCourses: [],
    setSelectedCourses: () => {},

    selectedClasses: {},
    setSelectedClasses: () => {},

    is12HourMode: storage.get('is12HourMode'),
    setIs12HourMode: () => {},

    isDarkMode: storage.get('isDarkMode'),
    setIsDarkMode: () => {},

    errorMsg: '',
    setErrorMsg: () => {},

    infoMsg: 'Press and hold to drag a class',

    errorVisibility: false,
    setErrorVisibility: () => {},

    infoVisibility: false,
    setInfoVisibility: () => {},

    isFriendsListOpen: isPreview,
    setIsFriendsListOpen: () => {},

    isLoggedIn: false,
    setIsLoggedIn: () => {},

    isSquareEdges: storage.get('isSquareEdges'),
    setIsSquareEdges: () => {},

    lastUpdated: 0,
    setLastUpdated: () => {},

});

const AppContextProvider = ({ children }: AppContextProviderProps) => {

    const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
    const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
    const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [infoMsg] = useState<string>('Press and hold to drag a class');
    const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
    const [infoVisibility, setInfoVisibility] = useState<boolean>(false);
    const [isFriendsListOpen, setIsFriendsListOpen] = useState(isPreview);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isSquareEdges, setIsSquareEdges] = useState<boolean>(storage.get('isSquareEdges'));
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
        errorMsg,
        setErrorMsg,
        infoMsg,
        errorVisibility,
        setErrorVisibility,
        infoVisibility,
        setInfoVisibility,
        isFriendsListOpen,
        setIsFriendsListOpen,
        isLoggedIn,
        setIsLoggedIn,
        isSquareEdges,
        setIsSquareEdges,
        lastUpdated,
        setLastUpdated,
    }

    return <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>;
};

export default AppContextProvider;