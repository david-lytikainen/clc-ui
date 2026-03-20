import React from 'react';
import { Box, Typography } from '@mui/material';

const About: React.FC = () => {
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
          sx={{ textAlign: 'left', mb: 3, fontWeight: 600 }}
        >
          Feels Like Home
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Cinnamon Leather Company is a woman-owned and operated workshop dedicated to crafting timeless
          leather goods by hand. Each piece is thoughtfully designed, cut, and finished using traditional
          techniques, quality materials, and careful attention to detail.
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Our designs are inspired by different kinds of people—the actress, the athlete, the one who never
          goes anywhere without a book—so that each piece reflects a unique facet of the person who carries
          it. Like the people who wear them, leather tells a story: it softens, deepens in color, and carries
          the marks of everyday life. We embrace these stories, creating unique handbags, wallets, and accessories.
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', lineHeight: 1.7 }}>
          At Cinnamon Leather Company, we believe the things you carry every day should be familiar,
          dependable, and uniquely yours—something that feels like home. Crafted with real materials and
          thoughtful care, our pieces are made to be lived with and loved for years to come.
        </Typography>
      </Box>
    </Box>
  );
};

export default About;
