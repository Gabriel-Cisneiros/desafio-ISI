'use client';

import { createTheme, Shadows } from '@mui/material/styles';

const FONT_FAMILY =
  'var(--font-geist-sans), system-ui, -apple-system, "Segoe UI", sans-serif';

const RADIUS = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
};

const SHADOW = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

const shadows = [
  'none',
  SHADOW.xs,
  SHADOW.sm,
  SHADOW.md,
  ...Array<string>(21).fill(SHADOW.lg),
] as Shadows;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#155dfc',
      dark: '#1447e6',
      light: '#eff6ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4f4f5',
      contrastText: '#18181b',
    },
    error: {
      main: '#e40016',
      dark: '#bf000f',
      light: '#fef2f2',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#b55200',
      dark: '#953d00',
      light: '#fffbeb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00813a',
      dark: '#016630',
      light: '#f0fdf4',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#09090b',
      secondary: '#686872',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    divider: '#e4e4e7',
    grey: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      500: '#91919b',
      700: '#3f3f46',
      900: '#18181b',
    },
  },
  shape: {
    borderRadius: RADIUS.md,
  },
  shadows,
  typography: {
    fontFamily: FONT_FAMILY,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.125rem',
      lineHeight: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    button: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: RADIUS.md,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: RADIUS.xl,
          boxShadow: SHADOW.xs,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: RADIUS.lg,
          boxShadow: SHADOW.lg,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.lg,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
        },
      },
    },
  },
});
