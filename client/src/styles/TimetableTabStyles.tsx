import { Box, Tab, Tabs, Theme, styled, Snackbar } from '@mui/material';

export const TimetableTabsContainer = styled(Box)`
  padding-top: 10px;
  padding-left: 66px;
  overflow: auto;
`;

export const TimetableTabContainer = styled(Tabs)`
  border-radius: 10px 10px 0 0;
  border-color: #bbbbbb;
  color: #808080;
`;

export const StyledTab = styled(Tab)`
  min-height: 50px;
  min-width: 150px;
  border-radius: 10px 10px 0 0;
  transition: background-color 0.1s;
  /* .MuiOutlinedInput-root {
    fieldset {
      background-color: red;
    }

    &.Mui-selected fieldset {
      background-color: red;
    }
    &:hover fieldset {
      background-color: red;
    }
    &:active fieldset {
      cursor: move;
    }
  } */

  /* border-style: solid; */
`;

export type TabTheme = {
  containerBackground: String;
  tabHoverColor: String;
  tabBackgroundColor: String;
  tabSelectedText: String;
};

export const tabThemeLight: TabTheme = {
  containerBackground: '#eeeeee',
  tabHoverColor: '#ffffff',
  tabBackgroundColor: '#ffffff',
  tabSelectedText: 'primary',
};

export const tabThemeDark: TabTheme = {
  containerBackground: '#2f2f2f',
  tabHoverColor: '#444444',
  tabBackgroundColor: '#444444',
  tabSelectedText: '#ffffff',
};

export const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    backgroundColor: theme.palette.mode === 'dark' ? '#444444' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#2f2f2f',
  },
}));

export const createTimetableStyle = (tabTheme: TabTheme, theme: Theme) => {
  const AddIconStyle = {
    position: 'sticky',
    right: '0px',
    padding: '10px',
    minWidth: '50px',
    minHeight: '50px',
    transition: 'background-color 0.1s',
    borderRadius: '50%',
    zIndex: '100',
    backgroundColor: `${tabTheme.containerBackground}`,
    opacity: 0.75,
    '&:hover': {
      backgroundColor: `${tabTheme.tabHoverColor}`,
    },
  };

  const TabContainerStyle = {
    backgroundColor: `${tabTheme.containerBackground}`,
  };

  const TabStyle = () => {
    return {
      '&.Mui-selected': {
        color: `${tabTheme.tabSelectedText}`,
        backgroundColor: `${tabTheme.tabBackgroundColor}`,
        boxShadow: `inset 0 0 7px ${theme.palette.primary.main}`,
        borderWidth: '1px',
        borderColor: `${theme.palette.primary.main}`,
        zIndex: '1',
      },
      '&:active': {
        cursor: 'move',
      },
      '&:hover': {
        backgroundColor: `${tabTheme.tabHoverColor}`,
      },
      borderRight: `1px solid ${theme.palette.secondary.main}`,
    };
  };

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

  return { AddIconStyle, TabContainerStyle, TabStyle, ModalButtonStyle };
};
