import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
const steps = ['Ordered', 'Shipped', 'Delivered'];

interface Props {
  status: string;
}

const OrderStatus: React.FC<Props> = ({ status }) => {
  const theme = useTheme();
  const grey = '#e0e0e0';

  const statusIndex = status === 'Ordered' ? 0 : status === 'Shipped' ? 1 : 2;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: i <= statusIndex ? theme.palette.primary.main : 'transparent',
                border: `2px solid ${i <= statusIndex ? theme.palette.primary.main : grey}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              {i <= statusIndex ? <CheckIcon sx={{ fontSize: 14 }} /> : null}
            </Box>
            <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>{label}</Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: '100%', height: 4, bgcolor: grey, borderRadius: 2 }}>
                {((statusIndex === i) || (statusIndex > i)) && (
                  <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: statusIndex > i ? '100%' : '50%', bgcolor: theme.palette.primary.main, borderRadius: 2 }} />
                )}
              </Box>
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default OrderStatus;
