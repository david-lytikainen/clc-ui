import React, { useEffect, useState } from 'react';
import { Box, Grid, CircularProgress, Typography, Paper, Link, Button } from '@mui/material';
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualImageUrls, setManualImageUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data?.url) setFeaturedUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchManualImage = async () => {
      try {
        for (let i = 1; i <= 2; i++) {
          const res = await fetch(`/api/product/${i}/image`);
          const data = await res.json();
          if (res.ok && data?.url) setManualImageUrls(prev => [...prev, data.url]);
          console.log(manualImageUrls)

        }
      } catch (err) {
        console.error('Failed to fetch manual product image', err);
      }
    };
    fetchManualImage();
  }, []);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Shop All</Typography>

      {/* Hardcoded test product card that hits /api/product/pdf */}
      <Box sx={{ mb: 3 }}>
        <Grid container>
          <Grid item sx={{ border: '.5px solid gray' }} xs={12} sm={6} md={4} lg={3}>
            {(() => {
              const manualProduct = {
                id: 0,
                title: 'test1',
                price: '49.99',
                imageUrl: manualImageUrls.length > 0 ? manualImageUrls[0] : '',
              };

              return <ProductCard product={manualProduct} />;
            })()}

          </Grid>
          <Grid item sx={{ border: '.5px solid gray' }} xs={12} sm={6} md={4} lg={3}>
            {(() => {
              const manualProduct = {
                id: 0,
                title: 'test2',
                price: '49.99',
                imageUrl: manualImageUrls.length > 0 ? manualImageUrls[2] : '',
              };

              return <ProductCard product={manualProduct} />;
            })()}

          </Grid>


          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
              <Button variant="contained" size="small" onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </Box>
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
