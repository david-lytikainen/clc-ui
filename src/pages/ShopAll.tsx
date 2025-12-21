import React, { useEffect, useState } from 'react';
import { Box, Grid, CircularProgress, Typography, Paper, Link } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

const ShopAll: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res || []))
      .catch((err) => setError(err?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Shop All</Typography>

      {/* Hardcoded test product card that hits /api/product/pdf */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            {(() => {
              const manualProduct = { id: 0, title: "test photo yay", price: '0.00', images: [] };
              const openPdf = async () => {
                try {
                  const res = await fetch('/api/product/pdf');
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'Failed');
                  const url = data?.url;
                  if (url) setFeaturedUrl(url);
                } catch (err) {
                  console.error(err);
                }
              };

              return <ProductCard product={manualProduct} onClick={openPdf} />;
            })()}
          </Grid>
        </Grid>
      </Box>
      {/* Show embedded PDF when available */}
      {featuredUrl && (
        <Box sx={{ mb: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              my: 2,
              height: { xs: 240, sm: 360 },
              maxWidth: 600,
              mx: 'auto',
              overflow: 'hidden',
            }}
          >
            <img src={featuredUrl} alt="Featured PDF" style={{ display: 'block', width: '100%', maxWidth: '100%', height: '100%', border: 0 }} />
          </Paper>
        </Box>
      )}
      
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ShopAll;
