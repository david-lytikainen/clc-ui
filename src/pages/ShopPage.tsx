import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../components/ProductCard';
import ProductCreateDialog from '../components/ProductCreateDialog';
import useProducts from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import type { ProductCard as ProductCardType } from '../services/api';

const PATH_TO_TYPE: Record<string, string[] | null> = {
  '/shop': null,
  '/leather-bags': ['Leather Bag'],
  '/wallets-accessories': ['Wallet', 'Accessory'],
};

const PATH_TO_TITLE: Record<string, string> = {
  '/shop': 'Shop All',
  '/leather-bags': 'Bags',
  '/wallets-accessories': 'Wallets & Accessories',
  '/your-favorites': 'Your Favorites',
  '/our-favorites': 'Our Favorites',
};

const ShopPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { products, setProducts } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

  const filterType = PATH_TO_TYPE[location.pathname] ?? null;
  const title = PATH_TO_TITLE[location.pathname] ?? 'Shop';

  const filteredProducts = useMemo(() => {
    if (!filterType?.length) return products;
    return products.filter(
      (p: ProductCardType) =>
        p.product_type_name != null && filterType.includes(p.product_type_name)
    );
  }, [products, filterType]);

  const shopCards = useMemo(() => {
    const rows: { key: string; product: ProductCardType; imageUrl: string | null }[] = [];
    for (const p of filteredProducts) {
      const urls =
        p.image_urls && p.image_urls.length > 0 ? p.image_urls : p.image_url ? [p.image_url] : [];
      if (urls.length === 0) {
        rows.push({ key: String(p.id), product: p, imageUrl: null });
      } else {
        urls.forEach((url, i) => {
          rows.push({ key: `${p.id}-${i}`, product: p, imageUrl: url });
        });
      }
    }
    return rows;
  }, [filteredProducts]);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  return (
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 3, py: 4, minHeight: 72, maxHeight: 85 }}>
        <Typography variant="h4" sx={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          {title}
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
        {shopCards.map(({ key, product: p, imageUrl }) => (
          <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
            <ProductCard
              product={{ ...p, image_url: imageUrl }}
              onClick={() => navigate(`/product/${p.id}`)}
            />
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

export default ShopPage;
