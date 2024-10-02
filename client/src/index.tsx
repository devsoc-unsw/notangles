import '@fontsource-variable/roboto-flex';
import './index.css';

import { BrowserTracing } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import App from './App';
import EventShareModal from './components/EventShareModal';
import AppContextProvider from './context/AppContext';
import CourseContextProvider from './context/CourseContext';
import UserContextProvider from './context/UserContext';
import * as swRegistration from './serviceWorkerRegistration';
import Friends from './components/friends/Friends';

Sentry.init({
  dsn: import.meta.env.VITE_APP_SENTRY_INGEST_CLIENT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const Root: React.FC = () => (
  <AppContextProvider>
    <CourseContextProvider>
      <UserContextProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />} path="/">
              <Route path="/event/:encrypted" element={<EventShareModal />} />
            </Route>
            <Route path="/friends" element={<Friends />} />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </CourseContextProvider>
  </AppContextProvider>
);

const root = createRoot(document.getElementById('root')!);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
