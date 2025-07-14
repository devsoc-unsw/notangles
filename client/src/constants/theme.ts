import { createTheme } from '@mui/material/styles';

export const borderRadius = 10;
export const borderWidth = 3;
export const rightContentPadding = 64;
export const leftContentPadding = 40;
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
      textColor: currentTheme ? currentTheme['text-color'] : '#2d2d2d',
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
      textColor: currentTheme ? currentTheme['text-color'] : '#ffffff',
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
  colors: [
    'oklch(0.52 0.0864 210.81)',
    'oklch(0.55 0.1767 329.22)',
    'oklch(0.42 0.11 251.57)',
    'oklch(0.55 0.1254 156.82)',
    'oklch(0.4 0.1491 27.31)',
    'oklch(0.6 0.1235 108.51)',
    'oklch(0.64 0.1948 256.93)',
    'oklch(0.39 0.2034 276.39)',
  ],
  'text-color': '#ffffff',
};

const theme_2 = {
  colors: [
    'oklch(0.8 0.1 0)',
    'oklch(0.8 0.1 40)',
    'oklch(0.8 0.1 80)',
    'oklch(0.8 0.1 120)',
    'oklch(0.8 0.1 160)',
    'oklch(0.8 0.1 200)',
    'oklch(0.8 0.1 240)',
    'oklch(0.8 0.1 280)',
  ],
  'text-color': '#2d2d2d',
};

const theme_3 = {
  colors: [
    'oklch(0.42 0.0759 268.74)',
    'oklch(0.47 0.097 288.06)',
    'oklch(0.52 0.1165 324.18)',
    'oklch(0.59 0.1565 346.36)',
    'oklch(0.64 0.1664 8.56)',
    'oklch(0.7 0.1909 24.11)',
    'oklch(0.74 0.174 50.51)',
    'oklch(0.75 0.17 71.19)',
  ],
  'text-color': '#ffffff',
};

const theme_4 = {
  colors: [
    'oklch(0.63 0.0599 273.4)',
    'oklch(0.47 0.0444 261.89)',
    'oklch(0.42 0.0601 251.87)',
    'oklch(0.37 0.0595 255.48)',
    'oklch(0.73 0.0271 261.13)',
    'oklch(0.76 0.0415 260.13)',
    'oklch(0.65 0.039 249.71)',
    'oklch(0.44 0.0423 265.5)',
  ],
  'text-color': '#ffffff',
};

const theme_5 = {
  colors: [
    'oklch(0.9 0.0437 57.12)',
    'oklch(0.95 0.0466 89.57)',
    'oklch(0.9 0.0297 180.75)',
    'oklch(0.89 0.0367 241.83)',
    'oklch(0.75 0.078 269.66)',
    'oklch(0.87 0.0499 303.52)',
    'oklch(0.77 0.0859 315.41)',
    'oklch(0.87 0.0586 344.43)',
  ],
  'text-color': '#2d2d2d',
};

export const themes = {
  Classic: theme_1,
  'Pastel Bliss': theme_2,
  'Vibrant Sunset': theme_3,
  'Cool Twilight': theme_4,
  'Soft Dawn': theme_5,
};
