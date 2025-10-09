import { Box, GlobalStyles, ThemeProvider } from '@mui/material';
import { styled, StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from '@sentry/react';
import React, { useMemo } from 'react';

import { useGetUserSettingsQuery } from './api/user/queries';
import T3SelectGif from './assets/T3-select.gif';
import Footer from './components/footer/Footer';
import Planner from './components/planner/Planner';
import PromotionPopup from './components/promotions/PromotionPopup';
import SubcomPromotion from './components/promotions/SubcomPromotion';
import Sidebar from './components/sidebar/Sidebar';
import Sponsors from './components/Sponsors';
import { contentPadding, darkTheme, lightTheme, rightContentPadding } from './constants/theme';

const StyledApp = styled(Box)`
  height: 100%;
`;

const Container = styled(Box)`
  display: flex;
  justify-content: center;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: ${contentPadding}px;
  padding-right: ${rightContentPadding}px;
  transition:
    background 0.2s,
    color 0.2s;
  min-height: 50vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.primary};
  overflow: hidden;
`;

const Content = styled(Box)`
  width: 1400px;
  max-width: 100%;
  transition: width 0.2s;
  display: grid;
  grid-template-rows: min-content min-content auto;
  grid-template-columns: auto;
  text-align: center;
`;

const App: React.FC = () => {
  const { preferredTheme, isDarkMode } = useGetUserSettingsQuery();

  const themeObject = useMemo(
    () => (isDarkMode ? darkTheme(preferredTheme) : lightTheme(preferredTheme)),
    [isDarkMode, preferredTheme],
  );

  const globalStyle = {
    body: {
      background: themeObject.palette.background.default,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      background: themeObject.palette.background.default,
      borderRadius: '5px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeObject.palette.secondary.main,
      borderRadius: '5px',
      opacity: 0.5,
      transition: 'background 0.2s',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: themeObject.palette.secondary.dark,
    },
  };

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themeObject}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <GlobalStyles styles={globalStyle} />
          <StyledApp>
            <Container>
              <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
              <ContentWrapper>
                <Content>
                  <Planner />
                  <Sponsors />
                  <Footer />
                  {/* <Alerts /> */}
                  <SubcomPromotion />
                  <PromotionPopup
                    imgSrc={T3SelectGif}
                    title="Next term's timetable has been released! 🎉"
                    subTitle="Organise, plan and schedule with newly released timetable"
                    bullets={[
                      {
                        main: 'Auto-timetable feature',
                        description:
                          'Automate process of manually scheduling tasks saving time and being more efficient',
                      },
                      {
                        main: 'Live data feedback',
                        description: 'Syncs with the current myUNSW class availabilities',
                      },
                      {
                        main: 'Create personal events',
                        description: 'Fully customisable and caters to your needs',
                      },
                    ]}
                  />
                </Content>
              </ContentWrapper>
            </Container>
          </StyledApp>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default Sentry.withProfiler(App);
