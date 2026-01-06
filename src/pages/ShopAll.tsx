import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Tooltip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProductCard from '../components/ProductCard';
import ProductCreateDialog from '../components/ProductCreateDialog';
import { getProducts, ProductType } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ShopAll: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res || []))
      .catch((err) => console.error('Failed to fetch products', err));
  }, []);

  return (
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h4">Shop All</Typography>
        {isAdmin() && (
          <Tooltip title="Create product" placement='left'>
            <IconButton color="primary" onClick={openCreate} aria-label="create-product">
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Grid container>
        {products.map((p) => (
          <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}>
            <ProductCard product={p} />
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
