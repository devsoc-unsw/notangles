import '@fontsource-variable/roboto-flex';
import './index.css';

import { ApolloProvider } from '@apollo/client';
import { browserTracingIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { client } from './api/config';
import App from './App';
import EventShareModal from './components/EventShareModal';
import LandingPage from './components/landingPage/LandingPage';
import AppContextProvider from './context/AppContext';
import CourseContextProvider from './context/CourseContext';
import * as swRegistration from './serviceWorkerRegistration';
import { AuthGuard } from './components/login/AuthGuard';
import { AuthProvider } from './hooks/useAuth';

Sentry.init({
  dsn: import.meta.env.VITE_APP_SENTRY_INGEST_CLIENT,
  integrations: [browserTracingIntegration()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const Root: React.FC = () => {
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
                    <AuthGuard>
                      <App />
                    </AuthGuard>
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
