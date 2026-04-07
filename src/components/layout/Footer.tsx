import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link } from '@mui/material';
import { colors } from '../../styles/colors';

const FOOTER_LINKS = [
  { label: 'Lead Time', to: '/lead-time' as const },
  { label: 'Leather Care Instructions', to: '/leather-care' as const },
  { label: 'Return Policy', to: '/return-policy' as const },
  { label: 'Privacy Policy', to: '/privacy-policy' as const },
  { label: 'Terms of Service', to: '/terms-of-service' as const },
] as const;

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        width: '100%',
        py: 1.25,
        px: 2,
        bgcolor: colors.background.default,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 3, md: 4 },
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {FOOTER_LINKS.map(({ label, to }) =>
          to ? (
            <Link
              key={label}
              component={RouterLink}
              to={to}
              underline="hover"
              sx={{
                color: colors.text.primary,
                fontSize: '0.8125rem',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          ) : (
            <Link
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              underline="hover"
              sx={{
                color: colors.text.primary,
                fontSize: '0.8125rem',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          ),
        )}
      </Box>
    </Box>
  );
};

export default Footer;
