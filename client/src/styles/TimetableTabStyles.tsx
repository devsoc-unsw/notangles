import { Theme } from '@mui/material';

export type TabTheme = {
  containerBackground: String;
  tabBorderColor: String;
  tabTextColor: String;
  tabHoverColor: String;
  tabBackgroundColor: String;
  tabSelectedText: String;
};

export const tabThemeLight: TabTheme = {
  containerBackground: '#eeeeee',
  tabBorderColor: '#bbbbbb',
  tabTextColor: '#808080',
  tabHoverColor: '#ffffff',
  tabBackgroundColor: '#ffffff',
  tabSelectedText: 'primary',
};

export const tabThemeDark: TabTheme = {
  containerBackground: '#2f2f2f',
  tabBorderColor: '#bbbbbb',
  tabTextColor: '#808080',
  tabHoverColor: '#444444',
  tabBackgroundColor: '#444444',
  tabSelectedText: '#ffffff',
};

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
    borderRadius: '10px 10px 0 0',
  };

  const TabStyle = (index: Number) => {
    let style = {
      minHeight: '50px',
      minWidth: '150px',
      paddingTop: '3px',
      paddingBottom: '3px',
      borderStyle: 'solid',
      borderWidth: '0px',
      borderRadius: '10px 10px 0 0',
      borderColor: `${tabTheme.tabBorderColor}`,
      color: `${tabTheme.tabTextColor}`,
      margin: '0 0 0 0',
      marginLeft: '-2px',
      transition: 'background-color 0.1s',
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
    };

    if (index === 0) {
      style.marginLeft = '0px';
    }

    return style;
  };

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

  return { AddIconStyle, TabContainerStyle, TabStyle, ModalButtonStyle };
};
