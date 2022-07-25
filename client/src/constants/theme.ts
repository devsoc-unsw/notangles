import { createTheme } from '@mui/material';

export const borderRadius = 10;
export const borderWidth = 3;
export const contentPadding = 15;
export const inventoryDropzoneOpacity = 0.1;
export const inventoryMargin = 10; // Gap between inventory column and main timetable

export interface ThemeType {
  palette: {
    mode: string | undefined;
    primary: {
      main: string;
    };
    background: {
      default: string;
      paper: string;
    };
    secondary: {
      main: string;
      dark: string;
      light: string;
    };
  };
  shape: {
    borderRadius: string;
  };
  breakpoints: {
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    up: (key: string) => string;
    down: (key: string) => string;
    only: (key: string) => string;
  };
}

const baseTheme = ({
  background,
  border,
  mode,
}: {
  mode: 'light' | 'dark' | undefined;
  background: {
    main: string;
    light: string;
    dark: string;
  };
  border: {
    main: string;
    dark: string;
  };
}) => ({
  palette: {
    mode: mode,
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
  },
  shape: {
    borderRadius,
  },
});

export const lightTheme = createTheme(
  baseTheme({
    mode: 'light',
    background: {
      main: '#fafafa',
      light: '#ffffff',
      dark: '#f2f2f2',
    },
    border: {
      main: '#bdbdbd',
      dark: '#999999',
    },
  })
);

export const darkTheme = createTheme(
  baseTheme({
    mode: 'dark',
    background: {
      main: '#212121',
      light: '#292929',
      dark: '#181818',
    },
    border: {
      main: '#616161',
      dark: '#808080',
    },
  })
);
