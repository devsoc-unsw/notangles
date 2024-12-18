import '@fontsource-variable/roboto-flex';
import './index.css';

import { ApolloProvider } from '@apollo/client';
import { BrowserTracing } from '@sentry/browser';
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
import UserContextProvider from './context/UserContext';
import * as swRegistration from './serviceWorkerRegistration';

Sentry.init({
  dsn: import.meta.env.VITE_APP_SENTRY_INGEST_CLIENT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const Root: React.FC = () => {
  const hasVisited = localStorage.getItem('visited');

  return (
    <ApolloProvider client={client}>
      <AppContextProvider>
        <CourseContextProvider>
          <UserContextProvider>
            <BrowserRouter>
              <Routes>
                {hasVisited ? (
                  <Route element={<App />} path="/">
                    <Route path="/event/:encrypted" element={<EventShareModal />} />
                  </Route>
                ) : (
                  <Route element={<LandingPage />} path="/" />
                )}
              </Routes>
            </BrowserRouter>
          </UserContextProvider>
        </CourseContextProvider>
      </AppContextProvider>
    </ApolloProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
