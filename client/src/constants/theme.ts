import { createMuiTheme } from '@material-ui/core';

export const borderRadius = 10;
export const inventoryDropzoneOpacity = 0.1;
export const contentPadding = 15;

export interface ThemeType {
  palette: {
    type: string | undefined,
    primary: {
      main: string,
    },
    background: {
      default: string,
      paper: string,
    },
    secondary: {
      main: string,
      dark: string,
      light: string,
    },
    action: {
      disabled: string,
    },
  },
  shape: {
    borderRadius: string,
  },
  breakpoints: {
    values: {
      xs: number,
      sm: number,
      md: number,
      lg: number,
      xl: number
    },
    down: (key: string) => string
  }
}

const baseTheme = ({
  type,
  background,
  border,
}: {
  type: 'light' | 'dark' | undefined,
  background: {
    main: string,
    light: string,
    dark: string,
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
      light: background.dark,
    },
    action: {
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  shape: {
    borderRadius,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 750, // change this
      lg: 1200,
      xl: 1536
    }
  }
});

export const lightTheme = createMuiTheme(baseTheme({
  type: 'light',
  background: {
    main: '#fafafa',
    light: '#fff',
    dark: '#f2f2f2',
  },
  border: {
    main: '#bdbdbd',
    dark: '#999999',
  },
}));

export const darkTheme = createMuiTheme(baseTheme({
  type: 'dark',
  background: {
    main: '#212121',
    light: '#292929',
    dark: '#181818',
  },
  border: {
    main: '#616161',
    dark: '#808080',
  },
}));
