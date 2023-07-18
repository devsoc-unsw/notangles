import { Box, BoxProps, Button, IconButton, IconButtonProps, Snackbar } from '@mui/material';
import { Theme, styled } from '@mui/material';

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

export const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    backgroundColor: theme.palette.mode === 'dark' ? '#444444' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#2f2f2f',
  },
}));

export const TabsSection = styled(Box)`
  padding-top: 10px;
  padding-left: 66px;
  overflow: auto;
  &::-webkit-scrollbar {
    height: 5px;
  }
`;

export const TabsWrapper = styled(Box)<BoxProps & { tabTheme: TabTheme }>`
  background-color: ${(props) => props.tabTheme.containerBackground.toString()};
  border-radius: 10px 10px 0 0;
  display: flex;
  width: max-content;
`;

export const StyledTabs = styled(Box)`
  display: flex;
`;

export const StyledSpan = styled('span')`
  margin-left: 8px;
  padding-top: 3px;
`;

export const StyledIconButton = styled(IconButton)<IconButtonProps & { tabTheme: TabTheme }>`
  position: sticky;
  right: 0px;
  padding: 10px;
  min-width: 50px;
  min-height: 50px;
  transition: background - color 0.1s;
  border-radius: 50;
  z-index: 100;
  background-color: ${(props) => props.tabTheme.containerBackground.toString()};
  opacity: 0.75;
  &:hover {
    background-color: ${(props) => props.tabTheme.tabHoverColor.toString()};
  }
`;

export const StyledModalButton = styled(Button)`
  margin: 10px;
  width: 80px;
  align-self: center;
`;

export const createTimetableStyle = (tabTheme: TabTheme, theme: Theme) => {
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
      borderColor: `${tabTheme.tabBorderColor} `,
      color: `${tabTheme.tabTextColor} `,
      margin: '0 0 0 0',
      marginLeft: '-2px',
      transition: 'background-color 0.1s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: '500',
      fontFamily: 'Roboto,Helvetica,Arial',
      lineHeight: '1.25',
      letterSpacing: '0.02857em',
      flexShrink: '0',
      zIndex: '',
      borderRight: `1px solid ${theme.palette.secondary.main} `,
      '&:active': {
        cursor: 'move',
      },
      '&:hover': {
        backgroundColor: `${tabTheme.tabHoverColor} `,
      },
    };

    if (index === 0) {
      style.marginLeft = '0px';
    }

    if (index === selectedTimetableIndex) {
      style.color = `#3a76f8`;
      style.backgroundColor = `${tabTheme.tabBackgroundColor} `;
      style.boxShadow = `inset 0 0 7px ${theme.palette.primary.main} `;
      style.borderWidth = '1px';
      style.borderColor = `${theme.palette.primary.main} `;
      style.zIndex = '1';
      style.borderRight = `1px solid ${theme.palette.primary.main} `;
    }

    return style;
  };

  return { TabStyle };
};
