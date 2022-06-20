import React from 'react';
import ReactDOM from 'react-dom';
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
  dsn: process.env.REACT_APP_SENTRY_INGEST_CLIENT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: Number(process.env.REACT_APP_SENTRY_TRACE_RATE_CLIENT),
});

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
