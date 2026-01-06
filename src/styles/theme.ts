// configures Material UI, tells the components which colors, fonts and styles to use - these are all used in App.tsx ThemeProvider
import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

// Theme configuration
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { // logo
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    secondary: { // green
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    background: { // base
      default: colors.background.default,
      paper: colors.background.base2, // base2,
    },
    common: {
      white: colors.background.white,
    },
    // Add accent color to palette
    info: { // accent
      main: colors.accent.main,
      light: colors.accent.light,
      dark: colors.accent.dark,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  typography: {
    fontFamily: [
      '"Tenure BC"',
      '"Averia GWF"',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: { // customizes UI fonts globally
    MuiButton: { // for all buttons 
      styleOverrides: {
        root: {
          borderRadius: 12, // rounded corners
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { // slight scale and shadow on hover
            transform: 'scale(1.02) translateY(-1px)',
            boxShadow: '0 4px 10px rgba(194, 96, 2, 0.25)', // Using primary color
          },
          '&:active': { // slight scale down on active (when being clicked)
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiPaper: { // a paper is a container/card component (probably a good use for product cards)
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { // slight lift and shadown on hover
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(194, 96, 2, 0.2)', // Using primary color
          },
        },
      },
    },
  },
});

