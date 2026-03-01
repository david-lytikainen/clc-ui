import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Grid, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

type ProfileUser = Awaited<ReturnType<typeof getCurrentUser>>;

interface ProfileField {
  label: string;
  value: string | number | null | undefined;
}

const Profile: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((data) => setUser(data))
      .catch((err) => setError(err?.response?.data?.error || err?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Please sign in to view your profile.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error || 'Profile not found'}</Typography>
      </Box>
    );
  }

  const fields: ProfileField[] = [
    { label: 'Email', value: user.email },
    { label: 'First name', value: user.first_name },
    { label: 'Last name', value: user.last_name },
    { label: 'Phone', value: user.phone ?? '—' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Grid container spacing={2}>
        {fields.map(({ label, value }) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {value ?? '—'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/orders')}
          sx={{ cursor: 'pointer' }}
        >
          My Orders
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => {
            signOut();
            navigate('/shop');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Sign out
        </Link>
      </Box>
    </Box>
  );
};

export default Profile;
