import '@fontsource-variable/roboto-flex';
import './index.css';

import { ApolloProvider } from '@apollo/client';
import { browserTracingIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
  integrations: [browserTracingIntegration()],
  tracesSampleRate: Number(import.meta.env.VITE_APP_SENTRY_TRACE_RATE_CLIENT),
});

const hasVisited = localStorage.getItem('visited');

const router = createBrowserRouter(
  hasVisited
    ? [
        {
          path: '/',
          element: <App />,
          children: [
            { path: 'event/:encrypted', element: <EventShareModal /> },
          ],
        },
      ]
    : [
        {
          path: '/',
          element: <LandingPage />,
        },
      ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const root = createRoot(document.getElementById('root')!);
root.render(
  <ApolloProvider client={client}>
    <AppContextProvider>
      <CourseContextProvider>
        <UserContextProvider>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
        </UserContextProvider>
      </CourseContextProvider>
    </AppContextProvider>
  </ApolloProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
