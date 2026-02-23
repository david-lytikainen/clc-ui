import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';

type ProductCardProps = {
  product: any;
  onClick?: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card sx={{ '&:hover': { transform: 'none' }, border: 1, borderColor: 'secondary.main', borderRadius: 0 }}>
      <CardActionArea
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        {product.image_url && (
          <CardMedia component="img" height="360" image={product.image_url} alt={product.title} />
        )}

        <CardContent
          sx={{
            backgroundColor: 'secondary.light',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.2 }}>{product.title}</Typography>
          <Typography variant="body2" color="text.secondary">${product.price}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
