import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, Grid, FormControl, Select, MenuItem, TextField, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderByNumber, getAdminOrderByNumber, updateAdminOrder, Order } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderStatus from '../components/OrderStatus';
import { useTheme } from '@mui/material/styles';

const SAVED_FEEDBACK_MS = 1500;

const OrderDetail: React.FC = () => {
  const theme = useTheme();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [data, setData] = useState<{ order_number: string; orders: Order[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<'tracking' | 'status' | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newNote, setNewNote] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [statusSelect, setStatusSelect] = useState('');

  useEffect(() => {
      localStorage.removeItem('cart');
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    const fetcher = isAdmin() ? getAdminOrderByNumber : getOrderByNumber;
    setLoading(true);
    fetcher(orderNumber)
      .then((res) => {
        setData(res);
        if (res.orders?.[0]) {
          setTrackingInput(res.orders[0].tracking_url ?? '');
          setStatusSelect(res.orders[0].status || 'Ordered');
        }
      })
      .catch((err) => setError(err?.response?.data?.error || 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderNumber, isAdmin]);

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  const handleSaveTracking = (tracking_url: string) => {
    if (!orderNumber || !isAdmin()) return;
    setSavingField('tracking');
    updateAdminOrder(orderNumber, { tracking_url: tracking_url || undefined })
      .then((res) => {
        setData(res);
        setTrackingInput(tracking_url || '');
        setSavedField('tracking');
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setSavedField(null), SAVED_FEEDBACK_MS);
      })
      .finally(() => setSavingField(null));
  };

  const handleSaveStatus = (status: string) => {
    if (!orderNumber || !isAdmin()) return;
    setSavingField('status');
    updateAdminOrder(orderNumber, { status })
      .then((res) => {
        setData(res);
        if (res.orders?.[0]) setStatusSelect(res.orders[0].status || 'Ordered');
        setSavedField('status');
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setSavedField(null), SAVED_FEEDBACK_MS);
      })
      .finally(() => setSavingField(null));
  };

  const handleAddNote = () => {
    const note = newNote.trim();
    if (!orderNumber || !isAdmin() || !note || !data?.orders?.length) return;
    const notes = data.orders[0].comments ?? [];
    const next = [...(Array.isArray(notes) ? notes : [notes]), note];
    setSavingField('notes');
    updateAdminOrder(orderNumber, { comments: next })
      .then((res) => {
        setData(res);
        setNewNote('');
      })
      .finally(() => setSavingField(null));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error || 'Order not found'}</Typography>
      </Box>
    );
  }

  const orders = data.orders;
  const notes: string[] = Array.isArray(orders[0]?.comments) ? orders[0].comments : (orders[0]?.comments ? [orders[0].comments] : []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thanks for your order!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Order #{data.order_number}
      </Typography>
      {isAdmin() && orders[0]?.customer_email && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Purchased by: {orders[0].customer_email}
        </Typography>
      )}
      {(isAdmin() || orders[0]?.tracking_url) && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isAdmin() ? (
            <>
              <TextField
                size="small"
                placeholder="Tracking URL (e.g. UPS link)"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                disabled={savingField === 'tracking'}
                sx={{ minWidth: 320 }}
                helperText={savingField === 'tracking' ? 'Saving…' : undefined}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleSaveTracking(trackingInput)}
                disabled={savingField === 'tracking'}
                sx={{
                  minWidth: 72,
                  height: 40,
                  transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                  ...(savedField === 'tracking'
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
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      opacity: savedField === 'tracking' ? 0 : 1,
                      transition: 'opacity 0.25s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    Save
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      opacity: savedField === 'tracking' ? 1 : 0,
                      transition: 'opacity 0.25s ease',
                      display: 'inline-flex',
                      pointerEvents: 'none',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 20 }} />
                  </Box>
                </Box>
              </Button>
            </>
          ) : (
            <Typography variant="body2">
              <a href={orders[0].tracking_url!} target="_blank" rel="noopener noreferrer">Track shipment</a>
            </Typography>
          )}
        </Box>
      )}
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {orders.map((o, idx) => (
          <ListItem key={o.id} divider sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2 }}>
            {o.image_url ? (
              <Box
                component="img"
                src={o.image_url}
                onClick={() => navigate(`/product/${o.product_id}`)}
                sx={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  backgroundColor: '#ddd',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: '#999' }}>
                  No Image
                </Typography>
              </Box>
            )}
            <Grid container>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {o.product_title}
                </Typography>
                {(o.color_name != null || o.color_hex != null) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    {o.color_hex ? (
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 0.5,
                          bgcolor: o.color_hex,
                          border: '1px solid rgba(0,0,0,0.15)',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <Typography variant="body2" color="text.secondary">
                      {o.color_name ?? (o.color_id != null ? `Color #${o.color_id}` : '')}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {new Date(o.created_at).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Qty:</strong> {o.quantity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total:</strong> ${(o.amount_cents / 100).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={7} sx={{ pt: 3 }}>
                {isAdmin() ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={statusSelect || 'Ordered'}
                        onChange={(e) => setStatusSelect(e.target.value)}
                        disabled={savingField === 'status'}
                      >
                        <MenuItem value="Ordered">Ordered</MenuItem>
                        <MenuItem value="Shipped">Shipped</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                      </Select>
                    </FormControl>
                    {idx === 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSaveStatus(statusSelect)}
                        disabled={savingField === 'status'}
                        sx={{
                          minWidth: 72,
                          height: 40,
                          transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                          ...(savedField === 'status'
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
                          <Box
                            component="span"
                            sx={{
                              position: 'absolute',
                              opacity: savedField === 'status' ? 0 : 1,
                              transition: 'opacity 0.25s ease',
                              pointerEvents: 'none',
                            }}
                          >
                            Save
                          </Box>
                          <Box
                            component="span"
                            sx={{
                              position: 'absolute',
                              opacity: savedField === 'status' ? 1 : 0,
                              transition: 'opacity 0.25s ease',
                              display: 'inline-flex',
                              pointerEvents: 'none',
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 20 }} />
                          </Box>
                        </Box>
                      </Button>
                    )}
                  </Box>
                ) : (
                  <OrderStatus status={o.status} />
                )}
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 600 }}>Notes:</Typography>
        {notes.map((note: string, i: number) => (
          <Typography key={i} variant="body2" color="text.secondary" display="block" sx={{ pl: 0, mt: 0.5 }}>
            {note}
          </Typography>
        ))}
        {isAdmin() && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <TextField
              size="small"
              placeholder="Add a note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              disabled={savingField === 'notes'}
              sx={{ flex: 1, maxWidth: 360 }}
            />
            <IconButton color="primary" onClick={handleAddNote} disabled={!newNote.trim() || savingField === 'notes'} size="small" aria-label="Add note">
              <AddIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OrderDetail;
