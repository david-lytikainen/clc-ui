import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../components/ProductCard';
import ProductCreateDialog from '../components/ProductCreateDialog';
import useProducts from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';

const ShopAll: React.FC = () => {
  const { isAdmin } = useAuth();
  const { products, setProducts, loading } = useProducts('all');
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  return (
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 3, py: 4, minHeight: 72, maxHeight: 85 }}>
        <Typography variant="h4" sx={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          Shop All
        </Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            color="primary"
            onClick={openCreate}
            aria-label="create-product"
          >
            Create product
          </Button>
        )}
      </Box>
      
      <Grid container>
        {products.map((p) => (
          <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={p} onClick={() => navigate(`/product/${p.id}`)} />
          </Grid>
        ))}
      </Grid>

      <ProductCreateDialog
        open={createOpen}
        onClose={closeCreate}
        onCreated={(created) => setProducts((prev) => [created, ...prev])}
      />
    </Box>
  );
};

export default ShopAll;
