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

  const TabsWrapperStyle = {
    backgroundColor: `${tabTheme.containerBackground}`,
    borderRadius: '10px 10px 0 0',
    display: 'flex',
    width: 'max-content',
  };

  const TabStyle = (index: Number, selectedTimetableIndex: Number) => {
    let style = {
      boxShadow: '',
      maxWidth: '360px',
      minHeight: '42px',
      minWidth: '118px',
      padding: '3px 16px',
      backgroundColor: '',
      borderStyle: 'solid',
      borderWidth: '0px',
      borderRadius: '10px 10px 0 0',
      borderColor: `${tabTheme.tabBorderColor}`,
      color: `${tabTheme.tabTextColor}`,
      margin: '0 0 0 0',
      marginLeft: '-2px',
      transition: 'background-color 0.1s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: "Roboto,Helvetica,Arial",
      lineHeight: '1.25',
      letterSpacing: '0.02857em',
      flexShrink: '0',
      zIndex: '',
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

    if (index === selectedTimetableIndex) {
      style.color = `#3a76f8`;
      style.backgroundColor = `${tabTheme.tabBackgroundColor}`;
      style.boxShadow = `inset 0 0 7px ${theme.palette.primary.main}`;
      style.borderWidth = '1px';
      style.borderColor = `${theme.palette.primary.main}`;
      style.zIndex = '1';
    }

    return style;
  };

  const TabContainerStyle = {
    paddingTop: '10px',
    overflow: 'auto',
    "::-webkit-scrollbar": {
      height: '5px'
    }
  }

  const MoreHorizWrapper = {
    marginLeft: '8px',
    paddingTop: '3px'
  }

  const ModalButtonStyle = { margin: '10px', width: '80px', alignSelf: 'center' };

  return { AddIconStyle, TabsWrapperStyle, TabContainerStyle, TabStyle, ModalButtonStyle, MoreHorizWrapper };
};
