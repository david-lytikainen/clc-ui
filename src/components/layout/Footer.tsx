import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1.2,
        }}
      >
        <IconButton
          component="a"
          href="https://www.facebook.com/profile.php?id=61572111125981"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          sx={{
            color: colors.primary.main,
            '&:hover': { color: colors.primary.dark, bgcolor: 'rgba(194, 96, 2, 0.06)' },
          }}
        >
          <FacebookIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.instagram.com/cinnamonleatherco/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          sx={{
            color: colors.primary.main,
            '&:hover': { color: colors.primary.dark, bgcolor: 'rgba(194, 96, 2, 0.06)' },
          }}
        >
          <InstagramIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
