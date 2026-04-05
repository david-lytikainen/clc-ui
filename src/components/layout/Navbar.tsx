import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, IconButton, Badge, Drawer, Collapse } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SignInModal from '../SignInModal';
import { useAuth } from '../../context/AuthContext';
import { ReactComponent as LargeNameTranspLogo } from '../../assets/LargeNameTranspLogo.svg';
import { getCart } from '../../services/api';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const hoverTimers = React.useRef<number[]>([]);
  const { user, isAuthenticated, signOut, isAdmin } = useAuth();
  const [cartCount, setCartCount] = useState(0);


  React.useEffect(() => {
    setUserMenuOpen(false);
  }, [isAuthenticated]);

  React.useEffect(() => {
    const updateLocal = () => {
      try {
        const raw = localStorage.getItem('cart');
        if (!raw) return setCartCount(0);
        const parsed = JSON.parse(raw);
        const items = parsed.items || parsed || [];
        const total = items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };
    updateLocal();
    window.addEventListener('storage', updateLocal);

    const handleCartUpdated = (e: any) => {
      const total = e.detail.items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
      setCartCount(total);
    };
    window.addEventListener('cartUpdated', handleCartUpdated);

    // if user logged in, fetch server count
    const fetchServer = async () => {
      if (isAuthenticated) {
        try {
          const cart = await getCart();
          const total = cart.items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
          setCartCount(total);
        } catch {
          // ignore
        }
      }
    };
    fetchServer();

    return () => {
      window.removeEventListener('storage', updateLocal);
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [isAuthenticated]);
  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'SHOP ALL', path: '/shop' },
    { label: 'HANDBAGS', path: '/leather-bags' },
    { label: 'WALLETS & ACCESSORIES', path: '/wallets-accessories' },
    // { label: 'GIFT CARDS', path: '/gift-cards' },
    { label: 'ABOUT', path: '/about' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 'auto',
        position: 'relative',
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
            alignSelf: 'center',
          }}
        >
          <LargeNameTranspLogo style={{ width: 250, height: 'auto' }} />
        </Box>

        {/* All tabs */}
        {!isMobile && <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                disableRipple
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  borderRadius: 0,
                  boxShadow: 'none',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.secondary.main,
                    boxShadow: 'none',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Box>}

        {/* User actions */}
        {!isMobile && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'absolute', right: 16, top: 16 }}>
          {isAuthenticated ? (
            <Box
              sx={{ position: 'relative' }}
              onMouseEnter={() => {
                setUserMenuOpen(true);
                setShowProfile(false); setShowOrders(false); setShowAdmin(false); setShowSignOut(false);
                hoverTimers.current.forEach(t => window.clearTimeout(t)); hoverTimers.current = [];

                hoverTimers.current.push(window.setTimeout(() => setShowProfile(true), 20));
                hoverTimers.current.push(window.setTimeout(() => setShowOrders(true), 170));
                if (isAdmin()) hoverTimers.current.push(window.setTimeout(() => setShowAdmin(true), 250));
                hoverTimers.current.push(window.setTimeout(() => setShowSignOut(true), 320));
              }}
              onMouseLeave={() => {
                setUserMenuOpen(false);
                hoverTimers.current.forEach(t => window.clearTimeout(t)); hoverTimers.current = [];
                setShowProfile(false); setShowOrders(false); setShowAdmin(false); setShowSignOut(false);
              }}
            >
              <Button
                disableRipple
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  borderRadius: 0,
                  boxShadow: 'none',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.secondary.main,
                    boxShadow: 'none',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Hi, {user?.first_name || 'User'}
              </Button>
              {userMenuOpen && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    bgcolor: 'transparent',
                    minWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <Box sx={{
                        opacity: showProfile ? 1 : 0,
                        transform: showProfile ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'opacity 0.5s, transform 0.5s',
                      }}>
                      <Button
                        disableRipple
                        onClick={() => navigate('/profile')}
                        sx={{
                          justifyContent: 'flex-end',
                          textTransform: 'none',
                          py: 0.5,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          borderRadius: 0,
                          boxShadow: 'none',
                          minWidth: 'auto',
                          '&:hover': { backgroundColor: 'transparent', boxShadow: 'none' },
                          '&:focus-visible': { outline: 'none', backgroundColor: 'transparent' },
                        }}
                      >
                        Profile
                      </Button>
                    </Box>
                    <Box sx={{
                        opacity: showOrders ? 1 : 0,
                        transform: showOrders ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'opacity 0.5s, transform 0.5s',
                      }}>
                      <Button
                        disableRipple
                        onClick={() => navigate('/orders')}
                        sx={{
                          justifyContent: 'flex-end',
                          textTransform: 'none',
                          py: 0.5,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          borderRadius: 0,
                          boxShadow: 'none',
                          minWidth: 'auto',
                          '&:hover': { backgroundColor: 'transparent', boxShadow: 'none' },
                          '&:focus-visible': { outline: 'none', backgroundColor: 'transparent' },
                        }}
                      >
                        My Orders
                      </Button>
                    </Box>
                    {isAdmin() && (
                    <Box sx={{
                        opacity: showAdmin ? 1 : 0,
                        transform: showAdmin ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'opacity 0.5s, transform 0.5s',
                      }}>
                      <Button
                        disableRipple
                        onClick={() => navigate('/admin/tools')}
                        sx={{
                          justifyContent: 'flex-end',
                          textTransform: 'none',
                          py: 0.5,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          borderRadius: 0,
                          boxShadow: 'none',
                          minWidth: 'auto',
                          '&:hover': { backgroundColor: 'transparent', boxShadow: 'none' },
                          '&:focus-visible': { outline: 'none', backgroundColor: 'transparent' },
                        }}
                      >
                        Admin Tools
                      </Button>
                    </Box>
                    )}
                    <Box sx={{
                        opacity: showSignOut ? 1 : 0,
                        transform: showSignOut ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'opacity 0.5s, transform 0.5s',
                      }}>
                      <Button
                        disableRipple
                        onClick={() => signOut()}
                        sx={{
                          justifyContent: 'flex-end',
                          textTransform: 'none',
                          py: 0.5,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          borderRadius: 0,
                          boxShadow: 'none',
                          minWidth: 'auto',
                          '&:hover': { backgroundColor: 'transparent', boxShadow: 'none' },
                          '&:focus-visible': { outline: 'none', backgroundColor: 'transparent' },
                        }}
                      >
                        Sign out
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
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
                color: theme.palette.secondary.main,
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
                color: theme.palette.secondary.main,
                backgroundColor: 'transparent',
              },
            }}
          >
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>}

        {isMobile && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: 12,
                top: 16,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                right: 12,
                top: 16,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={() => navigate('/cart')}
                aria-label="Cart"
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Box>
            <Drawer
              anchor="left"
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              PaperProps={{ sx: { width: '60vw', maxWidth: 360, p: 2 } }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                    sx={{ textTransform: 'none', px: 0, py: 0.75, justifyContent: 'flex-start' }}
                  >
                    {link.label === 'HOME' ? 'Home' : link.label === 'SHOP ALL' ? 'Shop All' : link.label === 'HANDBAGS' ? 'Handbags' : link.label === 'WALLETS & ACCESSORIES' ? 'Wallets & Accessories' : link.label === 'ABOUT' ? 'About' : link.label}
                  </Button>
                ))}
              </Box>

              {isAuthenticated ? (
                <>
                  <Button
                    disableRipple
                    onClick={() => setMobileUserOpen((v) => !v)}
                    endIcon={<ExpandMoreIcon sx={{ transform: mobileUserOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />}
                    sx={{
                      color: theme.palette.text.primary,
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      px: 0,
                      py: 0.75,
                      borderRadius: 0,
                      boxShadow: 'none',
                      backgroundColor: 'transparent',
                      '&:hover': { backgroundColor: 'transparent', boxShadow: 'none' },
                      '&:active': { backgroundColor: 'transparent', boxShadow: 'none' },
                      '&.Mui-focusVisible': { backgroundColor: 'transparent', boxShadow: 'none' },
                      '&:focus-visible': { outline: 'none', backgroundColor: 'transparent', boxShadow: 'none' },
                    }}
                  >
                    Hi, {user?.first_name || 'User'}
                  </Button>
                  <Collapse in={mobileUserOpen}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} sx={{ color: theme.palette.text.primary, textTransform: 'none', justifyContent: 'flex-start', py: .75 }}>Profile</Button>
                      <Button onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }} sx={{ color: theme.palette.text.primary, textTransform: 'none', justifyContent: 'flex-start', py: .75 }}>My Orders</Button>
                      {isAdmin() && (
                        <Button onClick={() => { navigate('/admin/tools'); setMobileMenuOpen(false); }} sx={{ color: theme.palette.text.primary, textTransform: 'none', justifyContent: 'flex-start', py: .75 }}>Admin Tools</Button>
                      )}
                      <Button onClick={() => { signOut(); setMobileMenuOpen(false); }} sx={{ color: theme.palette.text.primary, textTransform: 'none', justifyContent: 'flex-start', py: .75 }}>Sign out</Button>
                    </Box>
                  </Collapse>
                </>
              ) : (
                <Button
                  onClick={() => { setSignInModalOpen(true); setMobileMenuOpen(false); }}
                  sx={{ color: theme.palette.text.primary, textTransform: 'none', px: 0, py: .75, justifyContent: 'flex-start' }}
                >
                  Sign In
                </Button>
              )}
            </Drawer>
          </>
        )}

      </Toolbar>
      <SignInModal 
        open={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)} 
      />
    </AppBar>
  );
};

export default Navbar;

