import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, Grid } from '@mui/material';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import { getOrders, Order, getCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderStatus from '../components/OrderStatus';

const MyOrders: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');



  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    getOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error('fetch orders error', err);
        setError(err?.message || 'Unable to load orders');
      })
      .finally(() => setLoading(false));

    getCart()
      .then((res) => {
        const items = res.items || [];
        if (items.length === 0) {
          localStorage.setItem('cart', JSON.stringify({ items: [] }));
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [] } }));
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Please sign in to view your orders.</Typography>
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

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>You haven't placed any orders yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {orders.map((o) => (
          <ListItem key={o.id} divider sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2 }}>
            {o.image_url ? (
              <>
                <Box
                  component="img"
                  src={o.image_url}
                  onClick={() => navigate(`/product/${o.product_id}`)}
                  data-tooltip-id="product-tooltip"
                  data-tooltip-content="View Product"
                  data-tooltip-place="bottom"
                  sx={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                />
                <Tooltip id="product-tooltip" style={{ padding: '2px 4px', fontSize: '0.75rem' }} />
              </>
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
                    {o.order_number && (
                      <Typography
                        variant="body1"
                        component="button"
                        sx={{ fontWeight: 600, border: 0, background: 'none', cursor: 'pointer', color: 'primary.main', textAlign: 'left', p: 0, display: 'block', mb: 0.5 }}
                        onClick={() => navigate(`/orders/${o.order_number}`)}
                      >
                        Order #{o.order_number}
                      </Typography>
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {o.product_title}
                    </Typography>
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
                    <OrderStatus status={o.status} />
                </Grid>
            </Grid>
            
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MyOrders;
