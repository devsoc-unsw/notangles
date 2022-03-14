import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import AppContextProvider from './AppContext';
import Privacy from './components/Privacy';
import './index.css';
import * as serviceWorker from './serviceWorker';

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
    <BrowserRouter>
      <Routes>
        <Route element={<App />} path="/" />
        <Route element={<Privacy />} path="/privacy" />
      </Routes>
    </BrowserRouter>
  </AppContextProvider>
);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
