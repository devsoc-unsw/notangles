import type { JSX } from 'react';
// import { Navigate } from 'react-router';

// import { useAuth } from '../../hooks/useAuth';
// import PageLoading from '../pageLoading/PageLoading';

export function AuthGuard({ children }: { children: JSX.Element }) {
  // const { loading, loggedIn } = useAuth();

  // if (loading) return <PageLoading />;
  // if (!loggedIn) return <Navigate to="/" replace />;
  return children;
}
