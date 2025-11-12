// main react component - parent component?
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import './styles/fonts.css';
import './styles/global.css';
import { theme } from './styles/theme';

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

