import React from 'react';
import { Box, Typography } from '@mui/material';

const BULLETS = [
  'Avoid prolonged moisture. If the leather gets wet, gently pat it dry and allow it to air dry naturally.',
  'Condition periodically. Apply a small amount of leather conditioner all over the product every 2-3 months to keep the leather supple.',
  'Store properly. When not in use, keep your item in a cool, dry place away from direct sunlight.',
  'Use gently. Every leather piece tells a story! This means that natural marks and slight color variations are part of the character of real leather and will develop beautifully with use.',
] as const;

const LeatherCareInstructions: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: 'background.paper', minHeight: '60vh' }}>
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          maxWidth: { xs: '100%', md: '50%' },
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 0 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}
        >
          Leather Care Instructions
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Our products are made from high-quality, natural leather that will develop a rich patina over time.
          Because our items are handmade and made of natural materials, every piece is unique! To keep your
          item looking its best:
        </Typography>

        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0 }}>
          {BULLETS.map((text) => (
            <Typography
              key={text}
              component="li"
              variant="body1"
              sx={{ textAlign: 'left', mb: 1.5, lineHeight: 1.7, '&:last-child': { mb: 0 } }}
            >
              {text}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LeatherCareInstructions;
