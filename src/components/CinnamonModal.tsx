import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import { colors } from '../styles/colors';

interface CinnamonModalProps {
  open: boolean;
  onClose: () => void;
  onAnswer: (allergic: boolean) => void;
  loading?: boolean;
}

const CinnamonModal: React.FC<CinnamonModalProps> = ({
  open,
  onClose,
  onAnswer,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Are you allergic to cinnamon?</DialogTitle>
      <DialogContent />
      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button
          onClick={() => onAnswer(true)}
          disabled={loading}
          sx={{
            color: theme.palette.text.secondary,
            textTransform: 'none',
          }}
        >
          Yes
        </Button>
        <Button
          variant="contained"
          onClick={() => onAnswer(false)}
          disabled={loading}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: colors.background.white,
            textTransform: 'none',
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CinnamonModal;
