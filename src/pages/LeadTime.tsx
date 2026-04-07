import React from 'react';
import { Box, Typography } from '@mui/material';

const LeadTime: React.FC = () => {
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
          Lead Time
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Our products are hand-crafted and made to order, so please allow two weeks for your item to leave
          our studio. By that time, we will provide you with a shipping confirmation and a tracking number
          with your estimated delivery date.
        </Typography>
      </Box>
    </Box>
  );
};

export default LeadTime;
