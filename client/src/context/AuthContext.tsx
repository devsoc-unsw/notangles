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

const AuthContext = createContext<IAuthContext>({
  signIn: () => {},
  signOut: () => {},
  user: null,
  loading: false,
  token: null,
  error: null,
});

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
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
      const [_, state, code] = window.location.search.split('=');
      const response = await fetch(`/api/auth/token?state=${state}&code=${code}`);
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
