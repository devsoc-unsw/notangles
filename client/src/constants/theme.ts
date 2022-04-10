import { createTheme } from '@mui/material';

import { adaptV4Theme } from '@mui/material/styles';
import { type } from 'os';

export const borderRadius = 10;
export const inventoryDropzoneOpacity = 0.1;
export const contentPadding = 15;

export interface ThemeType {
  palette: {
    text: {
      primary: string;
    };
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
    action: {
      disabled: string;
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
  action,
  text,
  mode,
}: {
  type: 'light' | 'dark' | undefined;
  mode: any;
  background: {
    main: string;
    light: string;
    dark: string;
  };
  border: {
    main: string;
    dark: string;
  };
  action: {
    disabled: string;
  };
  text: {
    primary: string;
  };
}) => ({
  palette: {
    mode: mode,
    text: {
      primary: text.primary,
    },
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
      disabled: action.disabled,
    },
  },
  shape: {
    borderRadius,
  },
});

export const lightTheme = createTheme(
  baseTheme({
    mode: 'light',
    type: 'light',
    background: {
      main: '#fafafa',
      light: '#ffffff',
      dark: '#f2f2f2',
    },
    border: {
      main: '#bdbdbd',
      dark: '#999999',
    },
    action: {
      disabled: `rgba(0,0,0,0.5)`,
    },
    text: {
      primary: '#000000',
    },
  })
);

export const darkTheme = createTheme(
  baseTheme({
    mode: 'dark',
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
    action: {
      disabled: `rgba(255,255,255,0.5)`,
    },
    text: {
      primary: '#ffffff',
    },
  })
);
