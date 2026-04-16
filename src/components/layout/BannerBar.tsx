import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getBanner } from '../../services/api';
import { colors } from '../../styles/colors';


const BannerBar: React.FC = () => {
  const [banner, setBanner] = useState<{ text: string; background_color: string } | null>(null);

  useEffect(() => {
    const fetchBanner = () => {
      getBanner()
        .then((res) => {
          if (res.banner && res.banner.is_active && res.banner.text) {
            setBanner({ text: res.banner.text, background_color: res.banner.background_color });
          } else {
            setBanner(null);
          }
        })
        .catch(() => setBanner(null));
    };
    fetchBanner();
    window.addEventListener('bannerUpdated', fetchBanner);
    return () => window.removeEventListener('bannerUpdated', fetchBanner);
  }, []);

  if (!banner) return null;

  const bgColor = banner.background_color;
  const isDark = bgColor === colors.primary.dark || bgColor === colors.secondary.dark;
  const textColor = isDark ? '#fff' : colors.text.primary;

  return (
    <Box
      sx={{
        width: '100%',
        py: 1,
        px: 2,
        backgroundColor: bgColor,
        color: textColor,
        textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {banner.text}
      </Typography>
    </Box>
  );
};

export default BannerBar;
