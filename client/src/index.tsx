import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import App from './App';
import AppContextProvider from './context/AppContext';
import CourseContextProvider from './context/CourseContext';

import './index.css';
import * as swRegistration from './serviceWorkerRegistration';
import { setAvailableTermDetails } from './constants/timetable';
// initializing sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_INGEST_CLIENT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: Number(process.env.REACT_APP_SENTRY_TRACE_RATE_CLIENT),
});

const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

if (GOOGLE_ANALYTICS_ID !== undefined) {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
    // Debug messages in the browser console
    debug: process.env.NODE_ENV === 'development',
  });

  // Trigger page view on the home page
  ReactGA.pageview(window.location.pathname);
}

// // Automate term details.
// setAvailableTermDetails().then((res) => {});

const Root: React.FC = () => (
  <>
    <AppContextProvider>
      <CourseContextProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />} path="/" />
          </Routes>
        </BrowserRouter>
      </CourseContextProvider>
    </AppContextProvider>
  </>
);

ReactDOM.render(<Root />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
