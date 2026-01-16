import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CardMedia, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { getProductById, ProductWithImages } from '../services/api';

const ProductDetail: React.FC = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        <Grid item xs={12} md={5}>
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;
