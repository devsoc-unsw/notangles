import { createContext, useContext, useEffect, useState } from 'react';

import { getUserProfile } from '../api/user/routes';
import { UserInfo } from '../interfaces/User';

interface AuthStateData {
  loading: boolean;
  loggedIn: boolean;
  user: UserInfo | null;
}

interface AuthContextType extends AuthStateData {
  setUserState: React.Dispatch<React.SetStateAction<AuthStateData>>;
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  loggedIn: false,
  user: null,
  setUserState: () => {
    return null;
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthStateData>({
    loading: true,
    loggedIn: false,
    user: null,
  });

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setState({ loading: false, loggedIn: true, user: data });
      })
      .catch(() => {
        setState({ loading: false, loggedIn: false, user: null });
      });
  }, []);

  return <AuthContext.Provider value={{ ...state, setUserState: setState }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
