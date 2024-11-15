import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { API_URL } from '../api/config';
import { User } from '../components/sidebar/UserAccount';
import { Group } from '../interfaces/Group';
import NetworkError from '../interfaces/NetworkError';
import { DisplayTimetablesMap, TimetableDTO } from '../interfaces/Periods';
import { UserContextProviderProps } from '../interfaces/PropTypes';
import { parseTimetableDTO } from '../utils/syncTimetables';
import { createDefaultTimetable } from '../utils/timetableHelpers';
import { AppContext } from './AppContext';
import { CourseContext } from './CourseContext';

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
  setSelectedGroupIndex: (newSelectedGroupIndex: number) => void;
}

export const UserContext = createContext<IUserContext>({
  user: undefinedUser,
  setUser: () => {},
  groups: [],
  setGroups: () => {},
  fetchUserInfo: () => {},
  selectedGroupIndex: -1,
  setSelectedGroupIndex: () => {},
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User>(undefinedUser);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const { setDisplayTimetables, setSelectedTimetable, term, year } = useContext(AppContext);
  const { setSelectedClasses, setSelectedCourses, setCreatedEvents, setAssignedColors } = useContext(CourseContext);

  const getUserInfo = async (userID: string) => {
    try {
      const response = await fetch(`${API_URL.server}/user/profile/${userID}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const res = await response.json();
      const timetables = await Promise.all(
        res.data.timetables.map((timetable: TimetableDTO) => parseTimetableDTO(timetable, year)),
      );

      // Unpack timetables based on key
      const timetableMap: DisplayTimetablesMap = {};

      timetables.forEach(({ mapKey, timetable }) => {
        if (!timetableMap[mapKey]) {
          timetableMap[mapKey] = [];
        }
        timetableMap[mapKey].push(timetable);
      });

      const userResponse = { ...res.data, timetables: structuredClone(timetableMap) };
      setUser(userResponse);

      // Check current term exists. If not, create default timetable for this term
      // NOTE: This is AFTER setting the timetableMap for user.timetable. By doing this, we allow the runSync
      // function to pick up that there's a difference, and sync the default timetable with the backend.
      if (!Object.keys(timetableMap).includes(term)) {
        timetableMap[term] = createDefaultTimetable(res.data.userID);
      }
      setDisplayTimetables({ ...timetableMap });

      // TODO: check if this conditional is necessary
      if (timetableMap[term] && timetableMap[term][0]) {
        const { selectedCourses, selectedClasses, createdEvents, assignedColors } = timetableMap[term][0];
        setSelectedCourses(selectedCourses);
        setSelectedClasses(selectedClasses);
        setCreatedEvents(createdEvents);
        setAssignedColors(assignedColors);
        setSelectedTimetable(0);
      }
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

  const fetchUserInfo = (userID: string) => {
    if (term !== 'T0') getUserInfo(userID);
    getGroups(userID);
  };

  useEffect(() => {
    const getZid = async () => {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') {
          const userID = JSON.parse(userResponse);
          fetchUserInfo(userID);
        } else {
          setUser(undefinedUser);
          console.log('user is not logged in');
          throw new NetworkError("Couldn't get response for user information!");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getZid();
  }, [term]);

  const initialContext = useMemo(
    () => ({
      user,
      setUser,
      groups,
      setGroups,
      fetchUserInfo,
      selectedGroupIndex,
      setSelectedGroupIndex,
    }),
    [user, groups, selectedGroupIndex],
  );

  return <UserContext.Provider value={initialContext}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
