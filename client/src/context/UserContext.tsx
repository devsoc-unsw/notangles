import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { API_URL } from '../api/config';
import { User, UserDTO } from '../components/sidebar/UserAccount';
import { Group } from '../interfaces/Group';
import NetworkError from '../interfaces/NetworkError';
import { UserContextProviderProps } from '../interfaces/PropTypes';
import storage from '../utils/storage';
import { createDefaultTimetable, createTimetableForUser } from '../utils/timetableHelpers';
import { AppContext } from './AppContext';
import {
  ClassData,
  CourseData,
  CreatedEvents,
  DisplayTimetablesMap,
  EventPeriod,
  SelectedClasses,
  TimetableDTO,
  TimetableData,
} from '../interfaces/Periods';
import getCourseInfo from '../api/getCourseInfo';
import useColorMapper from '../hooks/useColorMapper';

export const undefinedUser = {
  userID: '',
  firstname: '',
  lastname: '',
  email: '',
  profileURL: '',
  createdAt: '',
  lastLogin: '',
  loggedIn: false,
  friends: [],
  incoming: [],
  outgoing: [],
  timetables: {},
};
export interface IUserContext {
  user: User;
  setUser: (newUser: User) => void;
  groups: Group[];
  setGroups: (newGroups: Group[]) => void;
  fetchUserInfo: (userID: string) => void;
  selectedGroupIndex: number; // selected group is the index of groups;
  setUserInfoOnStartup: (userId: string) => void;
  setSelectedGroupIndex: (newSelectedGroupIndex: number) => void;
  groupsSidebarCollapsed: boolean;
  setGroupsSidebarCollapsed: (isCollapsed: boolean) => void;
}

export const UserContext = createContext<IUserContext>({
  user: undefinedUser,
  setUser: () => {},
  groups: [],
  setGroups: () => {},
  fetchUserInfo: () => {},
  setUserInfoOnStartup: () => {},
  selectedGroupIndex: -1,
  setSelectedGroupIndex: () => {},
  groupsSidebarCollapsed: true,
  setGroupsSidebarCollapsed: () => {},
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const { setDisplayTimetables } = useContext(AppContext);

  const [user, setUser] = useState<User>(undefinedUser);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const [groupsSidebarCollapsed, setGroupsSidebarCollapsed] = useState<boolean>(true);
  const { term } = useContext(AppContext);

  // Helper function to determine what year a term is in
  const getTimetableYear = (targetTerm: string, currentTerm: string, currentYear: string) => {
    try {
      const pattern = /[0-9]+$/;
      const currNo = currentTerm.match(pattern);
      const targetNo = targetTerm.match(pattern);

      if (!currNo || !targetNo) {
        return currentYear;
      }

      // Example: 2023 T3 is before 2024 T1
      if (Number(targetNo[0]) > Number(currNo[0])) {
        return String(Number(currentYear) - 1);
      }

      return currentYear;
    } catch (e) {
      return currentYear;
    }
  };

  const parseTimetablesFromDb = async (timetables: TimetableDTO[]) => {
    let constructedTimetablesDataForLSRecord: Record<string, TimetableData[]> = {};
    timetables.forEach(async (timetable: TimetableDTO) => {
      const key = timetable.mapKey as string;
      if (!constructedTimetablesDataForLSRecord[key]) {
        constructedTimetablesDataForLSRecord[key] = [];
      }

      const parsedData = await _parseTimetableDTO(timetable, term, '2024');
      console.log('test', parsedData);
      constructedTimetablesDataForLSRecord[key].push(parsedData.timetable);
    });

    return constructedTimetablesDataForLSRecord;
    // console.log(constructedTimetablesDataForLSRecord);
  };

  // DATABASE TO FRONTEND PARSING of a timetable. TODO: change type later
  const _parseTimetableDTO = async (timetableDTO: TimetableDTO, currentTerm: string, currentYear: string) => {
    // First, recover course information from course info API
    const courseInfo: CourseData[] = await Promise.all(
      timetableDTO.selectedCourses.map((code: string) => {
        // TODO: populate with year and term dynamically (is convert to local timezone is a setting to recover)
        return getCourseInfo(
          getTimetableYear(timetableDTO.mapKey as string, currentTerm, currentYear),
          timetableDTO.mapKey as string,
          code,
          true,
        );
      }),
    );

    // Next, reverse the selected classes info from class data
    const classDataMap: Record<string, ClassData[]> = {}; // k (course code): v (ClassData[])
    courseInfo.forEach((course) => {
      classDataMap[course.code] = Object.values(course.activities).reduce((prev, curr) => prev.concat(curr));
    });

    const selectedClasses: SelectedClasses = {};
    timetableDTO.selectedClasses.forEach((scrapedClassDTO: any) => {
      const classID: string = scrapedClassDTO.classID;
      const courseCode: string = scrapedClassDTO.courseCode;

      if (!selectedClasses[courseCode]) {
        selectedClasses[courseCode] = {};
      }

      selectedClasses[courseCode][scrapedClassDTO.activity] =
        classDataMap[courseCode].find((clz) => String(clz.classNo) === String(classID)) || null;
    });

    // Finally, reverse created events
    const eventsList: EventPeriod[] = timetableDTO.createdEvents.map((eventDTO: any) => {
      return {
        type: 'event',
        subtype: eventDTO.subtype,
        time: {
          day: eventDTO.day,
          start: eventDTO.start,
          end: eventDTO.end,
        },
        event: {
          id: eventDTO.id,
          name: eventDTO.name,
          location: eventDTO.location,
          description: eventDTO.description || '',
          color: eventDTO.colour,
        },
      };
    });
    const createdEvents = eventsList.reduce((prev: CreatedEvents, curr) => {
      const id = curr.event.id;
      prev[id] = curr;
      return prev;
    }, {});

    const parsedTimetable: TimetableData = {
      id: timetableDTO.id,
      name: timetableDTO.name,
      selectedCourses: courseInfo,
      selectedClasses: selectedClasses,
      createdEvents: createdEvents,
      assignedColors: useColorMapper(timetableDTO.selectedCourses, {}),
    };

    return { mapKey: timetableDTO.mapKey, timetable: parsedTimetable };
  };
  // This fn will make sure to run everything and set
  // We need another fn just for setting up
  const setUserInfoOnStartup = async (userId: string) => {
    const userData = await getUserInfo(userId);
    if (!userData) return undefined;
    console.log(userData);

    const {
      userID,
      firstname,
      lastname,
      email,
      profileURL,
      createdAt,
      lastLogin,
      loggedIn,
      friends,
      incoming,
      outgoing,
      timetables,
    } = userData;
    const currentUser: User = {
      timetables: {},
      userID,
      firstname,
      lastname,
      email,
      profileURL,
      createdAt,
      lastLogin,
      loggedIn,
      friends,
      incoming,
      outgoing,
    };
    if (userData.timetables.length === 0) {
      user.timetables = { [term]: createDefaultTimetable() };
      console.log('User does not have a timetable, creating a default one!');
      createTimetableForUser(userData.userID, user.timetables[term][0], term);
      storage.set('timetables', user.timetables);
      setDisplayTimetables(user.timetables);
    } else {
      const parsedTts = await parseTimetablesFromDb(userData.timetables);
      currentUser.timetables = parsedTts;
      storage.set('timetables', parsedTts);
      setDisplayTimetables(parsedTts);
    }
    setUser(currentUser);
    console.log(currentUser);
    // return currentUser;
  };
  const getUserInfo = async (userID: string): Promise<UserDTO | undefined> => {
    if (userID === '') return undefined;
    try {
      const response = await fetch(`${API_URL.server}/user/profile/${userID}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const userResponse = await response.text();
      if (userResponse !== '') {
        let userData: UserDTO = JSON.parse(userResponse).data; // user from BE
        // console.log(userData.timetables);
        return userData;
      }
      return undefined;
    } catch (error) {
      console.log(error);
    }
  };

  const getGroups = async (userID: string) => {
    try {
      const res = await fetch(`${API_URL.server}/user/group/${userID}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const jsonData = await res.json();
      const groups = jsonData.data.groups;
      setGroups(groups);
      setSelectedGroupIndex(groups.length === 0 ? -1 : 0);
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  const fetchUserInfo = async (userID: string) => {
    await getUserInfo(userID);
    await getGroups(userID);
  };

  useEffect(() => {
    const abortController = new AbortController();
    const getZid = async () => {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') {
          const userID = JSON.parse(userResponse);
          setUserInfoOnStartup(userID);
        } else {
          throw new NetworkError("Couldn't get response");
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.log(error);
        }
      }
    };

    getZid();
    return () => {
      abortController.abort();
    };
  }, []);

  // useEffect(() => {
  //   if (user.userID) {
  //     console.log("User's timetable", user.timetables);
  //   }
  // }, [user]);
  const initialContext = useMemo(
    () => ({
      user,
      setUser,
      groups,
      setGroups,
      fetchUserInfo,
      setUserInfoOnStartup,
      selectedGroupIndex,
      setSelectedGroupIndex,
      groupsSidebarCollapsed,
      setGroupsSidebarCollapsed,
    }),
    [user, groups, selectedGroupIndex, groupsSidebarCollapsed],
  );

  return <UserContext.Provider value={initialContext}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
