import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  user: any | null;
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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const signIn = () => {
    window.location.href = 'http://localhost:3001/api/auth/login';
  };

  // Populate the state and auth code from the URL if they are there
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      setAuthCode(code);
    }

    if (state) {
      setState(state);
    }

    if (code && state) {
      setLoading(true);
      fetch('/api/auth/token?code=' + code + '&state=' + state)
        .then((res) => res.json())
        .then((data) => {
          setToken(data.access_token);
          setUser(data.userinfo);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        })
        .finally(() => {
          setAuthCode(null);
          setState(null);
        });
    }
  }, []);

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return {
    signIn,
    signOut,
    user,
    loading,
    token,
    error,
  };
}
