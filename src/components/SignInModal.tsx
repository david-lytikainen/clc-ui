import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, IconButton, Tabs, Tab, Typography, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { colors } from '../styles/colors';
import { createAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordTab from './ForgotPasswordTab';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0 = Sign In, 1 = Create Account, 2 = Forgot Password (desktop tab)
  const [showForgotPasswordMobile, setShowForgotPasswordMobile] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isMobile && activeTab === 2) {
      setActiveTab(0);
      setShowForgotPasswordMobile(true);
    }
  }, [isMobile, activeTab]);
  
  // Sign In form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Create Account form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setShowForgotPasswordMobile(false);
    setActiveTab(newValue);
    clearAllFields();
  };

  const clearAllFields = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 0) {
      setErrorMessage('');
      setLoading(true);
      auth.signIn(email, password).then(() => handleClose())
        .catch((err: any) => {
          console.error('Sign in failed', err);
          const msg = err?.response?.data?.error || err?.message || 'Failed to sign in';
          setErrorMessage(msg);
        })
        .finally(() => setLoading(false));

    } else {
      if (signUpPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }

      setErrorMessage('');
      setLoading(true);
      createAccount({
        first_name: firstName,
        last_name: lastName,
        email: signUpEmail,
        password: signUpPassword,
      })
        .then((res) => {
          if (res?.user) {
            auth.setUserFromPayload(res.user);
            handleClose();
          } else {
            console.warn('createAccount succeeded but no user returned');
            handleClose();
          }
        })
        .catch((err: any) => {
          console.error('Create account failed', err);
          const msg = err?.response?.data?.error || err?.message || 'Failed to create account';
          setErrorMessage(msg);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleClose = () => {
    clearAllFields();
    setActiveTab(0);
    setShowForgotPasswordMobile(false);
    onClose();
  };

  const showForgotContent =
    (!isMobile && activeTab === 2) || (isMobile && showForgotPasswordMobile);
  const tabsValue = isMobile && showForgotPasswordMobile ? 0 : activeTab;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.common.white,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 0,
        px: 0,
      }}>
        <Tabs 
          value={tabsValue} 
          onChange={handleTabChange}
          sx={{
            flex: 1,
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <Tab 
            label="Sign In" 
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Tab 
            label="Create Account" 
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          />
          {!isMobile && (
            <Tab
              label="Forgot Password"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          )}
        </Tabs>
        <IconButton
          onClick={handleClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {showForgotContent ? (
        <DialogContent>
          {isMobile && (
            <Button
              onClick={() => setShowForgotPasswordMobile(false)}
              sx={{ textTransform: 'none', mb: 2, px: 0, minWidth: 0 }}
            >
              ← Back to sign in
            </Button>
          )}
          <ForgotPasswordTab onClose={handleClose} />
        </DialogContent>
      ) : (
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {activeTab === 0 ? (
              // Sign In Form
              <>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                {isMobile && (
                  <Button
                    type="button"
                    onClick={() => setShowForgotPasswordMobile(true)}
                    sx={{
                      alignSelf: 'flex-start',
                      textTransform: 'none',
                      mt: -2,
                      px: 0,
                      minWidth: 0,
                      fontWeight: 600,
                    }}
                  >
                    Forgot password?
                  </Button>
                )}
              </>
            ) : (
              // Create Account Form
              <>
                <TextField
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <TextField
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: -1 }}>
                  Password must be at least 6 characters.
                </Typography>
                <TextField
                  label="Password"
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
              </>
            )}
          </Box>
        </DialogContent>

        {errorMessage && (
          <Box sx={{ px: 3 }}>
            <Typography color="error">{errorMessage}</Typography>
          </Box>
        )}

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: colors.background.white,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {activeTab === 0 ? 'Sign In' : (loading ? 'Creating...' : 'Create Account')}
          </Button>
        </DialogActions>
      </form>
      )}
    </Dialog>
  );
};

export default SignInModal;

