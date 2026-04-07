// main react component - parent component?
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import './styles/fonts.css';
import './styles/global.css';
import { theme } from './styles/theme';
import { colors } from './styles/colors';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import ProductDetail from './pages/ProductDetail';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminTools from './pages/AdminTools';
import EmailVerified from './pages/EmailVerified';
import About from './pages/About';
import LeadTime from './pages/LeadTime';
import LeatherCareInstructions from './pages/LeatherCareInstructions';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  
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
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/leather-bags" element={<ShopPage />} />
            <Route path="/wallets-accessories" element={<ShopPage />} />
            <Route path="/your-favorites" element={<ShopPage />} />
            <Route path="/our-favorites" element={<ShopPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/lead-time" element={<LeadTime />} />
            <Route path="/leather-care" element={<LeatherCareInstructions />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:orderNumber" element={<OrderDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify-email" element={<EmailVerified />} />
            <Route path="/admin/tools" element={<AdminTools />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

