import '@fontsource-variable/roboto-flex';
import './index.css';

import { ApolloProvider } from '@apollo/client';
import { browserTracingIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
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
import * as swRegistration from './serviceWorkerRegistration';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey;
    };
  }
}

Sentry.init({
  dsn: import.meta.env.VITE_APP_SENTRY_INGEST_CLIENT as string,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const Root: React.FC = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSettled: async (_data, _error, _variables, _context, mutation) => {
        {
          if (mutation.meta?.invalidatesQuery) {
            await queryClient.invalidateQueries({
              queryKey: mutation.meta.invalidatesQuery,
            });
          }
        }
      },
    }),
  });

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ApolloProvider client={client}>
          <AppContextProvider>
            <CourseContextProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route element={<LandingPage />} path="/" />
                  <Route
                    element={
                      <QueryClientProvider client={queryClient}>
                        <Suspense fallback={<PageLoading />}>
                          <AuthGuard>
                            <App />
                          </AuthGuard>
                          {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                        </Suspense>
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
    </ErrorBoundary>
  );
};

const rootContainer = document.getElementById('root');
if (!rootContainer) {
  throw new Error('Root container not found');
}
const root = createRoot(rootContainer);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
