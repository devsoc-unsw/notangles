import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, MuiThemeProvider, ThemeProvider } from '@material-ui/core';
import styled, { createGlobalStyle } from 'styled-components';

import App from './App';
import FriendsDrawer from './components/friends/Friends';
import Navbar from './components/Navbar';
import Privacy from './components/Privacy';
import { contentPadding, darkTheme, lightTheme, ThemeType } from './constants/theme';
import { isPreview } from './constants/timetable';
import AppContextProvider, { AppContext } from './context/AppContext';
import CourseContextProvider from './context/CourseContext';

import './index.css';
import * as swRegistration from './serviceWorkerRegistration';

const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

if (GOOGLE_ANALYTICS_ID !== undefined) {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
    // Debug messages in the browser console
    debug: process.env.NODE_ENV === 'development',
  });

  // Trigger page view on the home page
  ReactGA.pageview(window.location.pathname);
}

const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  body {
    background: ${({ theme }) => theme.palette.background.default};
    transition: background 0.2s;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.palette.background.default};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.secondary.main};
    border-radius: 5px;
    opacity: 0.5;
    transition: background 0.2s;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)<{ theme: ThemeType }>`
  text-align: center;
  padding-top: 64px; // for nav bar
  padding-left: ${contentPadding}px;
  padding-right: ${contentPadding}px;
  transition: background 0.2s, color 0.2s;
  min-height: 100vh;
  box-sizing: border-box;

  display: flex;
  flex-direction: row-reverse;
  justify-content: ${isPreview ? 'flex-start' : 'center'};

  color: ${({ theme }) => theme.palette.text.primary};
`;

const Root: React.FC = () => {
  const { isDarkMode } = useContext(AppContext);

  return (
    <AppContextProvider>
      <CourseContextProvider>
        <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <ContentWrapper>
              <GlobalStyle />
              <StyledApp>
                <Navbar />
                {isPreview && <FriendsDrawer />}
                <BrowserRouter>
                  <Routes>
                    <Route element={<App />} path="/" />
                    <Route element={<Privacy />} path="/privacy" />
                  </Routes>
                </BrowserRouter>
              </StyledApp>
            </ContentWrapper>
          </ThemeProvider>
        </MuiThemeProvider>
      </CourseContextProvider>
    </AppContextProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
swRegistration.register();
