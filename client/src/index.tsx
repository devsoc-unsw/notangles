import '@fontsource-variable/roboto-flex';
import './index.css';

import { ApolloProvider } from '@apollo/client';
import { browserTracingIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { client } from './api/config';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import EventShareModal from './components/EventShareModal';
import LandingPage from './components/landingPage/LandingPage';
import { AuthGuard } from './components/login/AuthGuard';
import PageLoading from './components/pageLoading/PageLoading';
import AppContextProvider from './context/AppContext';
import CourseContextProvider from './context/CourseContext';
import { AuthProvider } from './hooks/useAuth';
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey;
      successMessage?: string;
      errorMessage?: string;
    };
  }
}

Sentry.init({
  dsn: import.meta.env.VITE_APP_SENTRY_INGEST_CLIENT,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const Root: React.FC = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled: (_data, _error, _variables, _context, mutation) => {
        {
          if (mutation.meta?.invalidatesQuery) {
            queryClient.invalidateQueries({
              queryKey: mutation.meta.invalidatesQuery,
            });
          }
        }
      },
    }),
  });

  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <AppContextProvider>
          <CourseContextProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<LandingPage />} path="/" />
                <Route
                  element={
                    <QueryClientProvider client={queryClient}>
                      <ErrorBoundary>
                        <Suspense fallback={<PageLoading />}>
                          <AuthGuard>
                            <App />
                          </AuthGuard>
                          {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                        </Suspense>
                      </ErrorBoundary>
                    </QueryClientProvider>
                  }
                  path="/home"
                >
                  <Route path="/home/event/:encrypted" element={<EventShareModal />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CourseContextProvider>
        </AppContextProvider>
      </ApolloProvider>
    </AuthProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
