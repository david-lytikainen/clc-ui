import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { validateShippingZip } from '../services/api';

const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

type Props = {
  open: boolean;
  onClose: () => void;
  onNext: (zip: string) => void;
  loading?: boolean;
};

const ShippingZipModal: React.FC<Props> = ({ open, onClose, onNext, loading = false }) => {
  const [zip, setZip] = useState('');
  const [debounced, setDebounced] = useState('');
  const [checking, setChecking] = useState(false);
  const [backendOk, setBackendOk] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(zip.trim()), 400);
    return () => clearTimeout(t);
  }, [zip]);

  useEffect(() => {
    if (!open) {
      setZip('');
      setDebounced('');
      setBackendOk(false);
      setChecking(false);
      return;
    }
    if (!US_ZIP_REGEX.test(debounced)) {
      setBackendOk(false);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    setBackendOk(false);
    (async () => {
      try {
        const res = await validateShippingZip(debounced);
        if (!cancelled) {
          setBackendOk(Boolean(res.valid));
        }
      } catch {
        if (!cancelled) setBackendOk(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const formatInvalid = zip.length > 0 && !US_ZIP_REGEX.test(zip.trim());
  const showInvalidMessage = US_ZIP_REGEX.test(debounced) && !checking && !backendOk;

  const canNext = backendOk && !loading && !checking;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Enter your Zip Code</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Used for calculating the shipping cost.
        </Typography>
        <TextField
          autoFocus
          label="ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          fullWidth
          disabled={loading}
          placeholder="12345"
          inputProps={{ maxLength: 10, 'aria-label': 'ZIP code' }}
        />
        {(formatInvalid || showInvalidMessage) && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Invalid Zip Code
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canNext}
          onClick={() => onNext(debounced.slice(0, 5))}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShippingZipModal;
