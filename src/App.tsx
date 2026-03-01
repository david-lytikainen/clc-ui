// main react component - parent component?
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import './styles/fonts.css';
import './styles/global.css';
import { theme } from './styles/theme';
import { colors } from './styles/colors';
import Layout from './components/layout/Layout';
import ShopAll from './pages/ShopAll';
import { useAuth } from './context/AuthContext';
import LeatherBags from './pages/LeatherBags';
import Wallets from './pages/Wallets';
import Accessories from './pages/Accessories';
import ProductDetail from './pages/ProductDetail';
import MyOrders from './pages/MyOrders';
import Cart from './pages/Cart';

function App() {
  const { user, isAuthenticated, loading, signOut, isAdmin } = useAuth();
  
  // Automatically set all colors from colors.ts as CSS variables
  // This way global.css can use any color without manual updates
  useEffect(() => {
    // Primary colors
    document.documentElement.style.setProperty('--color-primary', colors.primary.main);
    document.documentElement.style.setProperty('--color-primary-light', colors.primary.light);
    document.documentElement.style.setProperty('--color-primary-dark', colors.primary.dark);
    
    // Secondary colors
    document.documentElement.style.setProperty('--color-secondary', colors.secondary.main);
    document.documentElement.style.setProperty('--color-secondary-light', colors.secondary.light);
    document.documentElement.style.setProperty('--color-secondary-dark', colors.secondary.dark);
    
    // Background colors
    document.documentElement.style.setProperty('--color-bg-default', colors.background.default);
    document.documentElement.style.setProperty('--color-bg-base2', colors.background.base2);
    document.documentElement.style.setProperty('--color-bg-white', colors.background.white);
    
    // Accent colors
    document.documentElement.style.setProperty('--color-accent', colors.accent.main);
    document.documentElement.style.setProperty('--color-accent-light', colors.accent.light);
    document.documentElement.style.setProperty('--color-accent-dark', colors.accent.dark);
    
    // Text colors
    document.documentElement.style.setProperty('--color-text-primary', colors.text.primary);
    document.documentElement.style.setProperty('--color-text-secondary', colors.text.secondary);
    document.documentElement.style.setProperty('--color-text-disabled', colors.text.disabled);
    
    // Status colors
    document.documentElement.style.setProperty('--color-success', colors.status.success);
    document.documentElement.style.setProperty('--color-error', colors.status.error);
    document.documentElement.style.setProperty('--color-warning', colors.status.warning);
    document.documentElement.style.setProperty('--color-info', colors.status.info);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/shop" element={<ShopAll />} />
            <Route path="/leather-bags" element={<LeatherBags />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

