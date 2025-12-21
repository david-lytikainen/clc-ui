import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';

type ProductCardProps = {
  product: any;
  onClick?: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const imageUrl = product?.images?.[0]?.s3_key || '';

  return (
    <Card>
      <CardActionArea onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
        {imageUrl && (
          <CardMedia component="img" height="160" image={imageUrl} alt={product.title} />
        )}
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>{product.title}</Typography>
          <Typography variant="body2" color="text.secondary">${product.price}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
