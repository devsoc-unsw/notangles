import { createTheme } from '@mui/material';

export const borderRadius = 10;
export const borderWidth = 3;
export const leftContentPadding = 138;
export const rightContentPadding = 64;
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
    in_text: {
      primary: string;
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
  textColor,
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
  textColor: string;
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
    in_text: {
      primary: textColor,
    },
  },
  shape: {
    borderRadius,
  },
});

export const lightTheme = (selectedColorTheme: string) => {
  const currentTheme = themes[selectedColorTheme as keyof typeof themes];
  if (!currentTheme) {
    console.error(`Invalid selectedColorTheme: ${selectedColorTheme}`);
    return createTheme({}); // Return a fallback theme
  }
  console.log('currentTheme', currentTheme);

  return createTheme({
    ...baseTheme({
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
      textColor: currentTheme['text-color'],
    }),
    typography: {
      fontFamily: [
        '"Roboto Flex Variable"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });
};



export const darkTheme = (selectedColorTheme: string) => {
  const currentTheme = themes[selectedColorTheme as keyof typeof themes];
  if (!currentTheme) {
    console.error(`Invalid selectedColorTheme: ${selectedColorTheme}`);
    return createTheme({}); // Return a fallback theme
  }

  return createTheme({
    ...baseTheme({
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
      textColor: currentTheme['text-color'],
    }),
    typography: {
      fontFamily: [
        '"Roboto Flex Variable"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });
};

const theme_1 = {
  'default-1': '#137786',
  'default-2': '#a843a4',
  'default-3': '#134e86',
  'default-4': '#138652',
  'default-5': '#861313',
  'default-6': '#868413',
  'default-7': '#2e89ff',
  'default-8': '#3323ad',
  'text-color': '#ffffff',
};

const theme_2 = {
  'default-1': '#cdb4db',
  'default-2': '#ffc8dd',
  'default-3': '#ffafcc',
  'default-4': '#bde0fe',
  'default-5': '#a2d2ff',
  'default-6': '#b9fbc0',
  'default-7': '#ffe156',
  'default-8': '#ff677d',
  'text-color': '#777777',
};

const theme_3 = {
  'default-1': '#3d4c78',
  'default-2': '#58508d',
  'default-3': '#8a508f',
  'default-4': '#bc5090',
  'default-5': '#de5a79',
  'default-6': '#ff6361',
  'default-7': '#ff8531',
  'default-8': '#ffa600',
  'text-color': '#ffffff',
};

const theme_4 = {
  'default-1': '#7e88af',
  'default-2': '#4c5a73',
  'default-3': '#344f6d',
  'default-4': '#2a415f',
  'default-5': '#9da7b8',
  'default-6': '#a1b1cb',
  'default-7': '#7d91a6',
  'default-8': '#465169',
  'text-color': '#ffffff',
};


export const themes = {
  'theme-1': theme_1,
  'theme-2': theme_2,
  'theme-3': theme_3,
  'theme-4': theme_4,
}