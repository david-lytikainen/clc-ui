import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Collapse, List, ListItem, Pagination, CircularProgress, Switch, FormControlLabel, TextField, Button, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getAdminOrders, getBanner, createBanner, getInactiveProductsAdmin, updateProduct, type BannerBackgroundColor, type ProductCard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import HomeAdmin from '../components/admin/HomeAdmin';

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
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [homeAdminOpen, setHomeAdminOpen] = useState(false);
  const [inactiveProductsOpen, setInactiveProductsOpen] = useState(false);
  const [hideDelivered, setHideDelivered] = useState(false);
  const [dateOrder, setDateOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [inactiveProducts, setInactiveProducts] = useState<ProductCard[]>([]);
  const [inactiveProductsLoading, setInactiveProductsLoading] = useState(false);
  const [inactiveDraftActiveById, setInactiveDraftActiveById] = useState<Record<number, boolean>>({});
  const [inactiveSavingById, setInactiveSavingById] = useState<Record<number, boolean>>({});
  const [inactiveSavedById, setInactiveSavedById] = useState<Record<number, boolean>>({});

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

  useEffect(() => {
    if (!inactiveProductsOpen || !isAuthenticated || !isAdmin()) return;
    setInactiveProductsLoading(true);
    getInactiveProductsAdmin()
      .then((rows) => {
        setInactiveProducts(rows);
        const initial: Record<number, boolean> = {};
        rows.forEach((p) => { initial[p.id] = false; });
        setInactiveDraftActiveById(initial);
      })
      .finally(() => setInactiveProductsLoading(false));
  }, [inactiveProductsOpen, isAuthenticated, isAdmin]);

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

  // Client-side filter and sort (no backend call)
  const getFilteredAndSortedOrderNumbers = (): string[] => {
    let list = [...orderNumbers];
    const ordersByNumber = data?.orders_by_number ?? {};
    if (hideDelivered) {
      list = list.filter((num) => {
        const orders = ordersByNumber[num] || [];
        const first = orders[0];
        const status = first?.status || 'Ordered';
        return status !== 'Delivered';
      });
    }
    if (statusFilter) {
      list = list.filter((num) => {
        const orders = ordersByNumber[num] || [];
        const first = orders[0];
        const status = first?.status || 'Ordered';
        return status === statusFilter;
      });
    }
    list.sort((a, b) => {
      const ordersA = ordersByNumber[a] || [];
      const ordersB = ordersByNumber[b] || [];
      const dateA = ordersA[0]?.created_at ? new Date(ordersA[0].created_at).getTime() : 0;
      const dateB = ordersB[0]?.created_at ? new Date(ordersB[0].created_at).getTime() : 0;
      return dateOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return list;
  };

  const displayedOrderNumbers = getFilteredAndSortedOrderNumbers();

  const collapsibleHeaderSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    py: 1.5,
    px: 2,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 0,
    transition: 'background-color 0.25s ease',
    '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)' },
    textAlign: 'left',
  };

  const toggleButtonSelectedSx = {
    '& .MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      color: '#fff',
      '&:hover': { backgroundColor: theme.palette.primary.light, opacity: 0.9 },
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Tools
      </Typography>

      {/* All Orders */}
      <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box
          component="button"
          onClick={() => setOrdersOpen((o) => !o)}
          sx={collapsibleHeaderSx}
        >
          <Typography>All Orders</Typography>
          <ExpandMoreIcon sx={{ transform: ordersOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </Box>
        <Collapse in={ordersOpen}>
          <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Filters - client-side only */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={hideDelivered} onChange={(_, v) => setHideDelivered(v)} color="primary" />}
                    label="Hide delivered"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Ordered Date</Typography>
                    <ToggleButtonGroup
                      value={dateOrder}
                      exclusive
                      onChange={(_, v) => v != null && setDateOrder(v)}
                      size="small"
                      sx={toggleButtonSelectedSx}
                    >
                      <ToggleButton value="asc" aria-label="oldest first">
                        <ArrowUpwardIcon fontSize="small" />
                      </ToggleButton>
                      <ToggleButton value="desc" aria-label="newest first">
                        <ArrowDownwardIcon fontSize="small" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ToggleButtonGroup
                      value={statusFilter}
                      exclusive
                      onChange={(_, v) => setStatusFilter(v === undefined ? null : v)}
                      size="small"
                      sx={toggleButtonSelectedSx}
                    >
                      <ToggleButton value="Ordered" sx={{ textTransform: 'none' }}>Ordered</ToggleButton>
                      <ToggleButton value="Shipped" sx={{ textTransform: 'none' }}>Shipped</ToggleButton>
                      <ToggleButton value="Delivered" sx={{ textTransform: 'none' }}>Delivered</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {displayedOrderNumbers.map((orderNumber) => {
                    const orders = data!.orders_by_number[orderNumber] || [];
                    const totalCents = orders.reduce((s, o) => s + (o.amount_cents || 0), 0);
                    const first = orders[0];
                    const status = first?.status || 'Ordered';
                    const created = first?.created_at ? new Date(first.created_at).toLocaleDateString() : '—';
                    const byLine = first?.user_id != null && (first?.user_first_name != null || first?.user_email != null)
                      ? ` by ${[first?.user_first_name, first?.user_last_name].filter(Boolean).join(' ')} ${first?.user_email ?? ''}`.trim()
                      : '';
                    const itemsLine = orders.map((o) => `${o.product_title ?? 'Item'} x${o.quantity ?? 1}`).join(', ');
                    return (
                      <ListItem
                        key={orderNumber}
                        divider
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 2,
                          p: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" sx={{ display: 'block', mb: 0.5 }}>
                            <Typography
                              component="button"
                              variant="body1"
                              onClick={() => navigate(`/orders/${orderNumber}`)}
                              sx={{
                                fontWeight: 600,
                                border: 0,
                                background: 'none',
                                cursor: 'pointer',
                                color: 'primary.main',
                                textAlign: 'left',
                                p: 0,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'none' },
                              }}
                            >
                              Order #{orderNumber}
                            </Typography>
                            {byLine && <Typography component="span" variant="body1"> {byLine}</Typography>}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {itemsLine}: <strong>${(totalCents / 100).toFixed(2)}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <Chip label={status} size="small" color="primary" variant="outlined" sx={{ mb: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Ordered on {created}
                          </Typography>
                        </Box>
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
          </Box>
        </Collapse>
      </Box>

      <Box sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box
          component="button"
          onClick={() => setHomeAdminOpen((o) => !o)}
          sx={collapsibleHeaderSx}
        >
          <Typography>Home Page</Typography>
          <ExpandMoreIcon sx={{ transform: homeAdminOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </Box>
        <Collapse in={homeAdminOpen}>
          <HomeAdmin />
        </Collapse>
      </Box>

      <Box sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box
          component="button"
          onClick={() => setInactiveProductsOpen((o) => !o)}
          sx={collapsibleHeaderSx}
        >
          <Typography>Inactive Products</Typography>
          <ExpandMoreIcon sx={{ transform: inactiveProductsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </Box>
        <Collapse in={inactiveProductsOpen}>
          <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
            {inactiveProductsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {inactiveProducts.map((p) => (
                  <ListItem
                    key={p.id}
                    divider
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, p: 2, flexWrap: 'wrap' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      {p.image_url ? (
                        <Box component="img" src={p.image_url} alt={p.title} sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1 }} />
                      ) : (
                        <Box sx={{ width: 56, height: 56, borderRadius: 1, bgcolor: 'action.hover' }} />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{p.title}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={inactiveDraftActiveById[p.id] ?? false}
                            onChange={(_, v) => setInactiveDraftActiveById((prev) => ({ ...prev, [p.id]: v }))}
                            color="primary"
                          />
                        }
                        label="Active"
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={inactiveSavingById[p.id]}
                        onClick={async () => {
                          setInactiveSavingById((prev) => ({ ...prev, [p.id]: true }));
                          try {
                            await updateProduct(p.id, { is_active: Boolean(inactiveDraftActiveById[p.id]) });
                            setInactiveSavedById((prev) => ({ ...prev, [p.id]: true }));
                            if (inactiveDraftActiveById[p.id]) {
                              setInactiveProducts((prev) => prev.filter((row) => row.id !== p.id));
                            }
                            setTimeout(() => {
                              setInactiveSavedById((prev) => ({ ...prev, [p.id]: false }));
                            }, SAVED_FEEDBACK_MS);
                          } finally {
                            setInactiveSavingById((prev) => ({ ...prev, [p.id]: false }));
                          }
                        }}
                        sx={{
                          minWidth: 72,
                          height: 40,
                          transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                          ...(inactiveSavedById[p.id]
                            ? {
                                backgroundColor: theme.palette.secondary.main,
                                color: '#fff',
                                borderColor: theme.palette.secondary.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.secondary.main,
                                  color: '#fff',
                                  borderColor: theme.palette.secondary.main,
                                },
                              }
                            : {}),
                        }}
                      >
                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24 }}>
                          <Box component="span" sx={{ position: 'absolute', opacity: inactiveSavedById[p.id] ? 0 : 1, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}>Save</Box>
                          <Box component="span" sx={{ position: 'absolute', opacity: inactiveSavedById[p.id] ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-flex', pointerEvents: 'none' }}>
                            <CheckIcon sx={{ fontSize: 20 }} />
                          </Box>
                        </Box>
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Banner */}
      <Box sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box
          component="button"
          onClick={() => setBannerOpen((o) => !o)}
          sx={collapsibleHeaderSx}
        >
          <Typography>Banner</Typography>
          <ExpandMoreIcon sx={{ transform: bannerOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </Box>
        <Collapse in={bannerOpen}>
          <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
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
                  sx={toggleButtonSelectedSx}
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
                    height: 40,
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                    ...(savedBanner
                      ? {
                          backgroundColor: theme.palette.secondary.main,
                          color: '#fff',
                          borderColor: theme.palette.secondary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.secondary.main,
                            color: '#fff',
                            borderColor: theme.palette.secondary.main,
                          },
                        }
                      : {}),
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
          </Box>
        </Collapse>
      </Box>

    </Box>
  );
};

export default AdminTools;
