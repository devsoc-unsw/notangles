import { createContext, useEffect, useMemo, useState } from 'react';

import { API_URL } from '../api/config';
import { User } from '../components/sidebar/UserAccount';
import { Group } from '../interfaces/Group';
import NetworkError from '../interfaces/NetworkError';
import { UserContextProviderProps } from '../interfaces/PropTypes';

//TODO, is this best practise?
const undefinedUser = {
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
      if (userResponse !== '') setUser(JSON.parse(userResponse).data);
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
    getUserInfo(userID);
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
          throw new NetworkError("Couldn't get response");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getZid();
  }, []);

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
