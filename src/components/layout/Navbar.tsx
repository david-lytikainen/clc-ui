import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useTheme } from '@mui/material/styles';
import SignInModal from '../SignInModal';
import { useAuth } from '../../context/AuthContext';
import { ReactComponent as LargeNameTranspLogo } from '../../assets/LargeNameTranspLogo.svg';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  const navLinks = [
    { label: 'SHOP ALL', path: '/shop' },
    { label: 'LEATHER BAGS', path: '/leather-bags' },
    { label: 'WALLETS', path: '/wallets' },
    { label: 'ACCESSORIES', path: '/accessories' },
    { label: 'GIFT CARDS', path: '/gift-cards' },
    { label: 'ABOUT', path: '/about' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: theme.palette.background.default,
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 'auto',
      }}>
        <Box 
          component={Link}
          to="/"
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
            py: 1,
          }}
        >
          <LargeNameTranspLogo style={{ width: 250, height: 'auto' }} />
        </Box>


        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {/* All tabs */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* User actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'absolute', right: 16, top: 16 }}>
            {isAuthenticated ? (
            <Tooltip title="Sign out">
              <Button
                onClick={() => signOut()}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Hi, {user?.first_name || 'User'}
              </Button>
            </Tooltip>
            ) :
            (<Button
              onClick={() => setSignInModalOpen(true)}
              sx={{
                color: theme.palette.text.primary,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main,
                },
              }}
            >
              SIGN IN
            </Button>)}
            

            <IconButton
              onClick={() => navigate('/cart')}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: 'transparent',
                },
              }}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
      <SignInModal 
        open={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)} 
      />
    </AppBar>
  );
};

export default Navbar;

