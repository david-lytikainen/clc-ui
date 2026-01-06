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
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          '&:hover .card-info': {
            transform: 'translateY(0%)',
            opacity: 1,
          },
        }}
      >
        {product.image_url && (
          <CardMedia component="img" height="320" image={product.image_url} alt={product.title} />
        )}

        <CardContent
          className="card-info"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.9)',
            transform: 'translateY(100%)',
            transition: 'transform 0.18s ease, opacity 0.18s ease',
            opacity: 0,
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>{product.title}</Typography>
          <Typography variant="body2" color="text.secondary">${product.price}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
