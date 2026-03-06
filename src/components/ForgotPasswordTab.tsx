import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import {
  requestForgotPasswordCode,
  verifyResetCode,
  resetPassword,
} from '../services/api';

type Step = 'email' | 'code' | 'password';

interface ForgotPasswordTabProps {
  onClose: () => void;
}

const ForgotPasswordTab: React.FC<ForgotPasswordTabProps> = ({ onClose }) => {
  const theme = useTheme();
  const auth = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.background.default,
    },
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestForgotPasswordCode(email);
      setStep('code');
      setCode('');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'No account associated with this email';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'code' || code.length !== 6) return;
    setError('');
    setVerifying(true);
    verifyResetCode(email, code)
      .then(() => setStep('password'))
      .catch(() => setError('Invalid code'))
      .finally(() => setVerifying(false));
  }, [step, code, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(email, code, newPassword);
      if (res?.user) {
        auth.setUserFromPayload(res.user);
        onClose();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestCode}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            fullWidth
            variant="outlined"
            sx={fieldSx}
          />
          {error && (
            <Typography color="error">{error}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3, px: 0 }}>
          <Button
            type="button"
            onClick={onClose}
            sx={{ color: theme.palette.text.secondary, textTransform: 'none' }}
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
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}
          >
            {loading ? 'Sending…' : 'Get Password Reset Code'}
          </Button>
        </Box>
      </form>
    );
  }

  if (step === 'code') {
    return (
      <Box sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit code we sent to {email}
          </Typography>
          <TextField
            inputRef={codeInputRef}
            label="Code"
            type="text"
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              setError('');
            }}
            placeholder="000000"
            fullWidth
            variant="outlined"
            sx={fieldSx}
            error={!!error}
            helperText={error}
          />
          {verifying && (
            <Typography variant="body2" color="text.secondary">
              Verifying…
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button
            type="button"
            onClick={onClose}
            sx={{ color: theme.palette.text.secondary, textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <form onSubmit={handleResetPassword}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: -1 }}>
          Password must be at least 6 characters.
        </Typography>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError('');
          }}
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          required
          fullWidth
          variant="outlined"
          sx={fieldSx}
          error={confirmPassword.length > 0 && newPassword !== confirmPassword}
          helperText={
            confirmPassword.length > 0 && newPassword !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
        />
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3, px: 0 }}>
        <Button
          type="button"
          onClick={onClose}
          sx={{ color: theme.palette.text.secondary, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: colors.background.white,
            textTransform: 'none',
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {loading ? 'Resetting…' : 'Reset and Sign In'}
        </Button>
      </Box>
    </form>
  );
};

export default ForgotPasswordTab;
