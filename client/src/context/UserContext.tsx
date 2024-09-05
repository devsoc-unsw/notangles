import { createContext, useEffect, useMemo, useState } from 'react';
import { UserContextProviderProps } from '../interfaces/PropTypes';
import { User } from '../components/sidebar/UserAccount';
import { API_URL } from '../api/config';
import { Group } from '../interfaces/Group';
import NetworkError from '../interfaces/NetworkError';

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
}

export const UserContext = createContext<IUserContext>({
  user: undefinedUser,
  setUser: () => {},
  groups: [],
  setGroups: () => {},
  fetchUserInfo: () => {},
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User>(undefinedUser);
  const [groups, setGroups] = useState<Group[]>([]);

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
      setGroups(jsonData.data.groups);
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
    }),
    [user, groups],
  );

  return <UserContext.Provider value={initialContext}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
