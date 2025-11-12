// main react component - parent component?
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';

const BACKGROUND_COLOR = '#FFF9F5';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D98B9C', // Adjust to your brand color
    },
    secondary: {
      main: '#B0A1C4',
    },
    background: {
      default: BACKGROUND_COLOR,
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A4A4A',
      secondary: '#6E6E6E',
    },
  },
  typography: {
    fontFamily: [
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.02) translateY(-1px)',
            boxShadow: '0 4px 10px rgba(217, 139, 156, 0.25)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(217, 139, 156, 0.2)',
          },
        },
      },
    },
  },
});

// Global styles
const globalStyleObject = {
  '*': {
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    '@media (min-width: 600px)': {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  html: {
    backgroundColor: BACKGROUND_COLOR,
    height: '100%',
  },
  body: {
    backgroundColor: BACKGROUND_COLOR,
    height: '100%',
    transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
    '@media (min-width: 600px)': {
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    },
  },
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyleObject} />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box 
            component="main" 
            sx={{
              flexGrow: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            {/* Your routes and components will go here */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <h1>Cinnamon Leather Co</h1>
              <p>Project setup complete! Start building your UI.</p>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

