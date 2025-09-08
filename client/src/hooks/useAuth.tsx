import { createContext, useContext, useEffect, useState } from 'react';

import { getUserProfile } from '../api/user/routes';
import { UserInfo } from '../interfaces/User';

interface AuthContextType {
  loading: boolean;
  loggedIn: boolean;
  user: UserInfo | null;
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  loggedIn: false,
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
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

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
