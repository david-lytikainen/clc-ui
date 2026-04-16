import React from 'react';
import { Box, Typography } from '@mui/material';

const sectionTitleSx = {
  textAlign: 'left' as const,
  fontWeight: 600,
  mt: 3,
  mb: 1,
};

const ReturnPolicy: React.FC = () => {
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
          Return Policy
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          We want you to love your purchase! As a small business, your satisfaction means everything to us.
          If something isn&apos;t right with your order, please reach out—we&apos;d love the opportunity to fix
          it. To begin a return, simply email us. Returns are accepted within 7 days of delivery and are subject
          to a 20% restocking fee.
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          To qualify for a return, items must be in their original condition—unused, unworn, and in the original
          packaging.
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          To initiate a return, contact us at cinnamonleatherco@gmail.com. If your return is approved,
          we&apos;ll provide instructions on how and where to send your item. Please note that returns sent
          without prior authorization will not be accepted.
        </Typography>

        <Typography variant="subtitle1" component="h3" sx={sectionTitleSx}>
          Damages and Issues
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          Each item is handmade with care. If your order arrives damaged or incorrect, let us know right away
          and we&apos;ll resolve the issue as quickly as possible.
        </Typography>

        <Typography variant="subtitle1" component="h3" sx={sectionTitleSx}>
          Refunds
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'left', mb: 2, lineHeight: 1.7 }}>
          After we receive and inspect your return, we&apos;ll notify you and issue a refund to your original
          payment method. Please keep in mind that processing times may vary depending on your bank or credit
          card provider.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReturnPolicy;
