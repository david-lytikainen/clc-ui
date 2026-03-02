import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Link, Pagination, CircularProgress, Switch, FormControlLabel, TextField, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getAdminOrders, getBanner, createBanner, type BannerBackgroundColor } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const PER_PAGE = 10;
const SAVED_FEEDBACK_MS = 1500;

const BANNER_COLOR_OPTIONS: { value: BannerBackgroundColor; label: string; hex: string }[] = [
  { value: 'primary', label: 'Logo', hex: colors.primary.main },
  { value: 'primary_dark', label: 'Dark logo', hex: colors.primary.dark },
  { value: 'secondary', label: 'Green', hex: colors.secondary.main },
  { value: 'secondary_dark', label: 'Dark green', hex: colors.secondary.dark },
];

const AdminTools: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [data, setData] = useState<{ orders_by_number: Record<string, any[]>; total: number; page: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bannerOn, setBannerOn] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerColor, setBannerColor] = useState<BannerBackgroundColor>('primary');
  const [bannerLoading, setBannerLoading] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const savedBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      return;
    }
    setLoading(true);
    getAdminOrders(page, PER_PAGE)
      .then((res) => setData({ orders_by_number: res.orders_by_number, total: res.total, page: res.page }))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, page]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) return;
    setBannerLoading(true);
    getBanner()
      .then((res) => {
        if (res.banner) {
          setBannerOn(res.banner.is_active);
          setBannerText(res.banner.text);
          setBannerColor(res.banner.background_color as BannerBackgroundColor);
        }
      })
      .finally(() => setBannerLoading(false));
  }, [isAuthenticated, isAdmin]);

  useEffect(() => () => {
    if (savedBannerTimeoutRef.current) clearTimeout(savedBannerTimeoutRef.current);
  }, []);

  const handleSaveBanner = () => {
    if (!isAdmin()) return;
    setSavingBanner(true);
    createBanner({ is_active: bannerOn, text: bannerText, background_color: bannerColor })
      .then(() => {
        setSavedBanner(true);
        if (savedBannerTimeoutRef.current) clearTimeout(savedBannerTimeoutRef.current);
        savedBannerTimeoutRef.current = setTimeout(() => setSavedBanner(false), SAVED_FEEDBACK_MS);
        window.dispatchEvent(new CustomEvent('bannerUpdated'));
      })
      .finally(() => setSavingBanner(false));
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Please sign in to view admin tools.</Typography>
      </Box>
    );
  }

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Access denied.</Typography>
      </Box>
    );
  }

  const orderNumbers = data ? Object.keys(data.orders_by_number) : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin tools
      </Typography>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Update Orders</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List>
                {orderNumbers.map((orderNumber) => {
                  const orders = data!.orders_by_number[orderNumber] || [];
                  const totalCents = orders.reduce((s, o) => s + (o.amount_cents || 0), 0);
                  const first = orders[0];
                  const created = first?.created_at ? new Date(first.created_at).toLocaleDateString() : '—';
                  return (
                    <ListItem key={orderNumber} sx={{ display: 'block', py: 1 }}>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => navigate(`/orders/${orderNumber}`)}
                        sx={{ cursor: 'pointer', textAlign: 'left' }}
                      >
                        Order #{orderNumber} — {created} — ${(totalCents / 100).toFixed(2)} ({orders.length} item{orders.length !== 1 ? 's' : ''})
                      </Link>
                    </ListItem>
                  );
                })}
              </List>
              {data && data.total > PER_PAGE && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(data.total / PER_PAGE)}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={false} sx={{ mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Banner</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {bannerLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={bannerOn} onChange={(_, v) => setBannerOn(v)} color="primary" />}
                  label="Banner on"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Banner text (one line)"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value.slice(0, 500))}
                  sx={{ minWidth: 280, flex: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Background:</Typography>
                <ToggleButtonGroup
                  value={bannerColor}
                  exclusive
                  onChange={(_, v) => v != null && setBannerColor(v)}
                  size="small"
                >
                  {BANNER_COLOR_OPTIONS.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: opt.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                        
                      </Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSaveBanner}
                  disabled={savingBanner}
                  sx={{
                    minWidth: 72,
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                    ...(savedBanner ? { backgroundColor: theme.palette.secondary.main, color: '#fff', borderColor: theme.palette.secondary.main } : {}),
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24 }}>
                    <Box component="span" sx={{ position: 'absolute', opacity: savedBanner ? 0 : 1, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}>Save</Box>
                    <Box component="span" sx={{ position: 'absolute', opacity: savedBanner ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-flex', pointerEvents: 'none' }}>
                      <CheckIcon sx={{ fontSize: 20 }} />
                    </Box>
                  </Box>
                </Button>
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AdminTools;
