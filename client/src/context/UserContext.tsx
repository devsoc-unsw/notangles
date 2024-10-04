import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { API_URL } from '../api/config';
import { User } from '../components/sidebar/UserAccount';
import { Group } from '../interfaces/Group';
import NetworkError from '../interfaces/NetworkError';
import { UserContextProviderProps } from '../interfaces/PropTypes';
import storage from '../utils/storage';
import { createDefaultTimetable } from '../utils/timetableHelpers';
import { AppContext } from './AppContext';
import {
  ClassData,
  CourseData,
  CreatedEvents,
  DisplayTimetablesMap,
  EventPeriod,
  SelectedClasses,
  TimetableData,
} from '../interfaces/Periods';

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
  timetables: [],
};

export interface IUserContext {
  user: User;
  setUser: (newUser: User) => void;
  groups: Group[];
  setGroups: (newGroups: Group[]) => void;
  fetchUserInfo: (userID: string) => void;
  selectedGroupIndex: number; // selected group is the index of groups;
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
  selectedGroupIndex: -1,
  setSelectedGroupIndex: () => {},
  groupsSidebarCollapsed: true,
  setGroupsSidebarCollapsed: () => {},
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User>(undefinedUser);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const [groupsSidebarCollapsed, setGroupsSidebarCollapsed] = useState<boolean>(true);
  const { term } = useContext(AppContext);

  const convertClassToDTO = (selectedClasses: SelectedClasses) => {
    const a = Object.values(selectedClasses);
    const b = a.map((c) => {
      const d = Object.values(c);
      console.log('d', d);

      return d.map((c) => {
        console.log('c', c);

        const { id, classNo, year, term, courseCode } = c as ClassData;
        return { id, classNo: String(classNo), year, term, courseCode };
      });
    });

    console.log('a', a);
    console.log('b', b);

    return b.reduce((prev, curr) => prev.concat(curr), []);
  };

  const createTimetableForUser = async (userId: string, timetable: TimetableData, timetableTerm: string) => {
    try {
      if (!userId) {
        console.log('User is not logged in');
        return;
      }
      const { selectedCourses, selectedClasses, createdEvents, name } = timetable;
      await fetch(`${API_URL.server}/user/timetable`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedCourses: selectedCourses.map((t) => t.code),
          selectedClasses: convertClassToDTO(selectedClasses),
          createdEvents: [],
          // createdEvents: convertEventToDTO(createdEvents),
          name,
          mapKey: timetableTerm,
        }),
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getUserInfo = async (userID: string) => {
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
        let userData: User = JSON.parse(userResponse).data;
        if (userData.timetables.length === 0) {
          userData.timetables = createDefaultTimetable();
          storage.set('timetables', { [term]: userData.timetables });
          console.log('User does no have a timetable, creating a default one!');
          createTimetableForUser(userData.userID, userData.timetables[0], term);
        }
        setUser(userData);
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
          fetchUserInfo(userID);
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

  useEffect(() => {
    if (user.userID) {
      storage.set('timetables', user.timetables);
      console.log('Updating Local Storage with timetables', user.timetables);
    }
  }, [user]);
  const initialContext = useMemo(
    () => ({
      user,
      setUser,
      groups,
      setGroups,
      fetchUserInfo,
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
