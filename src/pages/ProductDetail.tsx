import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, CardMedia, CircularProgress, Grid, Paper, Typography, useTheme } from '@mui/material';
import { getProductById, ProductWithImages, createCheckoutSession, syncCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creatingStripeCheckout, setCreatingStripeCheckout] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const id = Number(productId);
    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || err.message || 'Failed to load product');
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (product && product.image_urls && product.image_urls.length > 0) {
      setSelectedImage(product.image_urls[0]);
    } else {
      setSelectedImage(null);
    }
  }, [product]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
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

  if (!product) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container>
        <Grid item xs={2} sm={2} md={1} sx={{ display: { sm: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pt: 2 }}>
            {product.image_urls?.map((url, i) => (
              <Box
                key={i}
                component="img"
                src={url}
                onClick={() => setSelectedImage(url)}
                sx={{
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: (theme) => selectedImage === url ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)'
                }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={10} md={4}>
          <Box sx={{ p: 2, pl: 0 }}>
            <CardMedia component="img" height="500" image={selectedImage || product.image_urls?.[0]} alt={product.title} />
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{product.title}</Typography>
            <Typography variant="subtitle1" >{product.description}</Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</strong>
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2"><strong>Dimensions:</strong> {product.dimensions}</Typography>
              <Typography variant="body2"><strong>Color:</strong> {product.color}</Typography>
            </Box>
            <Box sx={{ mt: 4 }}>
              <Button type="button" variant="contained"
                size='large'
                  onClick={async () => {
                    if (adding) return;
                    setAdding(true);
                    try {
                      const item = {
                        id: product.id,
                        product_id: product.id,
                        product_title: product.title,
                        image_url: product.image_urls?.[0] || null,
                        quantity: 1,
                        price_cents: Math.round(product.price * 100),
                      };

                      const raw = localStorage.getItem('cart');
                      let cart: any = { items: [] };
                      if (raw) {
                        try { const parsed = JSON.parse(raw); cart.items = parsed.items || parsed || []; } catch (e) { cart.items = []; }
                      }
                      const existing = cart.items.find((i: any) => i.product_id === item.product_id);
                      if (existing) existing.quantity = (existing.quantity || 0) + 1;
                      else cart.items.unshift(item);
                      localStorage.setItem('cart', JSON.stringify(cart));
                      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: cart.items } }));

                      if (isAuthenticated) {
                        try { await syncCart(cart.items); } catch (e) { console.warn('Cart sync failed', e); }
                      }
                    } finally { setAdding(false); }
                  }}
                  sx={{
                  display: 'flex', flexDirection: 'column', height: '30px', width: '150px',
                  backgroundColor: theme.palette.info.main, color: colors.background.white,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.info.dark,
                  },
                  }}
              >
                  {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button type="button" variant="contained"
                sx={{
                  mt: 1, display: 'flex', flexDirection: 'column', height: '30px', width: '150px',
                  backgroundColor: theme.palette.primary.main, color: colors.background.white,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                onClick={async () => {
                  if (!product || !product.stripe_price_id) {
                    alert('No price configured for this product');
                    return;
                  }
                  try {
                    setCreatingStripeCheckout(true);
                    const data = await createCheckoutSession(product.stripe_price_id, 1);
                    if (data && data.url) window.location.href = data.url;
                    else {
                      console.error(data);
                      alert((data && data.error) || 'Failed to create checkout session');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Network error');
                  } finally {
                    setCreatingStripeCheckout(false);
                  }
                }}
              >
                {creatingStripeCheckout ? <CircularProgress size={18} sx={{ color: colors.background.white }} /> : 'Buy Now'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;
