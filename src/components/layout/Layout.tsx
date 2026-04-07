// wrapper component for navbar and other shared components
import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import BannerBar from './BannerBar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <BannerBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;

