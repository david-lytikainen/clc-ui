import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../components/ProductCard';
import ProductCreateDialog from '../components/ProductCreateDialog';
import useProducts from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';

const LeatherBags: React.FC = () => {
  const { isAdmin } = useAuth();
  const { products, setProducts, loading } = useProducts('Leather Bag');
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  return (
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h4">Leather Bags</Typography>
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

export default LeatherBags;
