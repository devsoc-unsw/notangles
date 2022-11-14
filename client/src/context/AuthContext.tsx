import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

export interface User {
  sub: string;
  givenName: string;
  familyName: string;
  email: string;
  picture: string;
}

interface TokenResponse {
  accessToken: string;
  user: User;
}

interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  user: User | null;
  loading: boolean;
  token: string | null;
  error: string | null;
}

const authContext = createContext<IAuthContext>({
  signIn: () => {},
  signOut: () => {},
  user: null,
  loading: false,
  token: null,
  error: null,
});

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const auth = useAuthProvider();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useAuthProvider() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(() => {
    window.location.href = 'http://localhost:3001/api/auth/login';
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setLoading(false);
    setUser(null);
    setError(null);
  }, []);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/auth/token?state=${window.location.search.split('=')[1]}&code=${window.location.search.split('=')[2]}`
      );
      const data: TokenResponse = await response.json();

      if (data.accessToken && data.user) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('token', data.accessToken);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      setLoading(false);
    } else {
      // Check for code and state in URL
      if (window.location.search.includes('code') && window.location.search.includes('state')) {
        fetchToken();
      }
    }
  }, []);

  return {
    signIn,
    signOut,
    user,
    loading,
    token,
    error,
  };
}
