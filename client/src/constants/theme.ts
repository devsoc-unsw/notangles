import { createMuiTheme } from '@material-ui/core';

const baseTheme = ({
  type,
  background,
  border,
}: {
  type: 'light' | 'dark' | undefined,
  background: {
    main: string,
    light: string,
  },
  border: {
    main: string,
    dark: string,
  }
}) => ({
  palette: {
    type,
    primary: {
      main: '#3a76f8',
    },
    background: {
      default: background.main,
      paper: background.light,
    },
    secondary: {
      main: border.main,
      dark: border.dark,
    },
    action: {
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export const lightTheme = createMuiTheme(baseTheme({
  type: 'light',
  background: {
    main: '#fafafa',
    light: '#fff',
  },
  border: {
    main: '#bdbdbd',
    dark: '#757575',
  },
}));

export const darkTheme = createMuiTheme(baseTheme({
  type: 'dark',
  background: {
    main: '#212121',
    light: '#292929',
  },
  border: {
    main: '#616161',
    dark: '#9e9e9e',
  },
}));
