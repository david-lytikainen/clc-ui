import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, Grid, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import { getCart, syncCart, createCartCheckoutSession } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

interface CartItem {
  id: number;
  product_id: number;
  product_title: string;
  image_url?: string;
  quantity: number;
  price_cents: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadLocal = () => {
      const raw = localStorage.getItem('cart');
      if (!raw) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || parsed || []);
      } catch (e) {
        setItems([]);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      getCart()
        .then((data) => setItems(data.items || []))
        .catch(() => loadLocal())
        .finally(() => setLoading(false));
    } else {
      loadLocal();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Your cart is empty.</Typography>
      </Box>
    );
  }

  const totalCents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          My Cart
        </Typography>
      </Box>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <ListItem key={it.id} divider sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, position: 'relative' }}>
            {it.image_url ? (
              <>
                <Box
                  component="img"
                  src={it.image_url}
                  onClick={() => navigate(`/product/${it.product_id}`)}
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
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {it.product_title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Qty:</strong> {it.quantity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Price:</strong> ${(it.price_cents / 100).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={7} sx={{ pt: 3 }}>
                <Typography variant="body2">
                  <strong>Item Total:</strong> ${(it.price_cents * it.quantity / 100).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ position: 'absolute', right: 8, top: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    const next = it.quantity <= 1 ? 0 : it.quantity - 1;
                    const nextItems = next === 0
                      ? items.filter(x => x.id !== it.id)
                      : items.map(x => x.id === it.id ? { ...x, quantity: next } : x);
                    setItems(nextItems);
                    localStorage.setItem('cart', JSON.stringify({ items: nextItems }));
                    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: nextItems } }));
                    if (isAuthenticated) { syncCart(nextItems).catch(() => {}); }
                  }}
                  sx={{ p: 0.5 }}
                >
                  <RemoveIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography variant="body2" sx={{ px: 1, minWidth: 20, textAlign: 'center' }}>
                  {it.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    const nextItems = items.map(x =>
                      x.id === it.id ? { ...x, quantity: x.quantity + 1 } : x
                    );
                    setItems(nextItems);
                    localStorage.setItem('cart', JSON.stringify({ items: nextItems }));
                    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: nextItems } }));
                    if (isAuthenticated) { syncCart(nextItems).catch(() => {}); }
                  }}
                  sx={{ p: 0.5 }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              <IconButton
                size="small"
                onClick={async () => {
                  const filtered = items.filter(x => x.id !== it.id);
                  setItems(filtered);
                  localStorage.setItem('cart', JSON.stringify({ items: filtered }));
                  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: filtered } }));
                  if (isAuthenticated) {
                    try { await syncCart(filtered); } catch {};
                  }
                }}
                data-tooltip-id="remove-tooltip"
                data-tooltip-content="Remove from cart"
                data-tooltip-place="bottom"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Tooltip id="remove-tooltip" style={{ padding: '2px 4px', fontSize: '0.75rem' }} />
          </ListItem>
        ))}

        <ListItem sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${(totalCents / 100).toFixed(2)}</Typography>
          {checkoutError && (
            <Typography variant="body2" color="error" sx={{ flex: 1 }}>
              {checkoutError}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 1 }}
            disabled={checkoutLoading}
            onClick={async () => {
              if (!items?.length) return;
              setCheckoutLoading(true);
              setCheckoutError(null);
              try {
                if (isAuthenticated) await syncCart(items);
                const { url } = await createCartCheckoutSession(
                  items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
                );
                if (url) window.location.href = url;
              } catch (e: any) {
                const msg = e?.response?.data?.error || e?.message || 'Checkout failed';
                setCheckoutError(msg);
                setCheckoutLoading(false);
              }
            }}
          >
            {checkoutLoading ? <CircularProgress size={18} sx={{ color: colors.background.white }} /> : `Proceed to checkout (${items.reduce((s, i) => s + i.quantity, 0)} items)`}
          </Button>
        </ListItem>
      </List>
    </Box>
  );
};

export default Cart;
