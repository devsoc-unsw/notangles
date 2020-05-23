import { createMuiTheme } from '@material-ui/core';

const primary = '#3a76f8';
const disabled = 'rgba(255, 255, 255, 0.5)';
export const borderRadius = 10;

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    secondary: {
      main: '#777', // borders
      dark: '#202020', // background
    },
    primary: {
      main: primary,
    },
    action: {
      disabled,
    },
  },
  shape: {
    borderRadius,
  },
});

export const lightTheme = createMuiTheme({
  palette: {
    secondary: {
      main: '#bbb', // borders
      dark: '#fff', // background
    },
    primary: {
      main: primary,
    },
    action: {
      disabled,
    },
  },
  shape: {
    borderRadius,
  },
});
