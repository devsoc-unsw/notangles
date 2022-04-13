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

// initializing sentry
Sentry.init({
  dsn: 'https://e4555a736f024545bef4a45873315f6a@o1179870.ingest.sentry.io/6292248',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.6,
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

const Root: React.FC = () => (
  <AppContextProvider>
    <CourseContextProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />} path="/" />
        </Routes>
      </BrowserRouter>
    </CourseContextProvider>
  </AppContextProvider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.unregister();
