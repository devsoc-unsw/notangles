import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Self } from '../interfaces/Friends';

interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  user: Self | null;
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
  const [user, setUser] = useState<Self | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

    if (code) params.delete('code');
    if (state) params.delete('state');

    // Apply params to the URL
    window.history.replaceState(null, '', url.pathname);

    const fetchToken = async () => {
      const data = fetch('/api/auth/token?code=' + code + '&state=' + state)
        .then((res) => res.json())
        .then((data) => {
          const { access_token, uid } = data;
          setToken(access_token);
          return { userId: uid, token: access_token };
        });

      return data;
    };

    const fetchUser = async (userId: string, token: string) => {
      fetch(`/api/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.data);
        });
    };

    const exchangeToken = async () => {
      const { userId, token } = await fetchToken();
      await fetchUser(userId, token);
    };

    if (code && state) {
      setLoading(true);
      exchangeToken()
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
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
