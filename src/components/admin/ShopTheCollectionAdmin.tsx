import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@mui/material/styles';
import { getShopTheCollectionAdmin, saveShopTheCollectionAdmin, type ShopTheCollectionRow } from '../../services/api';

const SAVED_FEEDBACK_MS = 1500;

function buildDraft(
  favorites: ShopTheCollectionRow[],
  products: { id: number }[],
  maxSlots: number
): (number | null)[] {
  const draft = Array<number | null>(maxSlots).fill(null);
  if (maxSlots === 0) return draft;
  const active = new Set(products.map((p) => p.id));
  for (const row of favorites) {
    if (row.sort_order >= maxSlots) continue;
    if (active.has(row.product_id)) draft[row.sort_order] = row.product_id;
  }
  return draft;
}

function lastFilledIndex(draft: (number | null)[]): number {
  let last = -1;
  for (let i = 0; i < draft.length; i++) {
    if (draft[i] != null) last = i;
  }
  return last;
}

function visibleCount(draft: (number | null)[], maxSlots: number): number {
  if (maxSlots === 0) return 0;
  const last = lastFilledIndex(draft);
  return last < 0 ? 1 : Math.min(maxSlots, last + 2);
}

const ShopTheCollectionAdmin: React.FC<{ active: boolean }> = ({ active }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: number; title: string }[]>([]);
  const [draft, setDraft] = useState<(number | null)[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxSlots = products.length;
  const nVisible = useMemo(() => visibleCount(draft, maxSlots), [draft, maxSlots]);

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    getShopTheCollectionAdmin()
      .then((res) => {
        setProducts(res.products);
        const m = res.products.length;
        setDraft(buildDraft(res.favorites, res.products, m));
      })
      .finally(() => setLoading(false));
  }, [active]);

  const setSlot = (index: number, value: number | null) => {
    setDraft((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    saveShopTheCollectionAdmin(draft.slice(0, nVisible))
      .then((res) => {
        setDraft(buildDraft(res.favorites, products, maxSlots));
        setSaved(true);
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setSaved(false), SAVED_FEEDBACK_MS);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, px: 2, backgroundColor: 'background.paper' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (maxSlots === 0) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          No active products — add or activate a product first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
        {Array.from({ length: nVisible }, (_, i) => (
          <Box
            key={i}
            sx={{
              flex: '0 0 auto',
              width: { xs: 'calc(100vw / 3)', md: 'calc(100vw / 8)', lg: 'calc(100vw / 10)' },
              minWidth: 0,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {i + 1}
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                labelId={`stc-${i}`}
                value={draft[i] == null ? '' : String(draft[i])}
                onChange={(e) => {
                  const v = e.target.value;
                  setSlot(i, v === '' ? null : Number(v));
                }}
              >
                <MenuItem value="">
                  <em>Empty</em>
                </MenuItem>
                {products.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleSave}
          disabled={saving}
          sx={{
            minWidth: 72,
            height: 40,
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            ...(saved
              ? {
                  backgroundColor: theme.palette.secondary.main,
                  color: '#fff',
                  borderColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                    color: '#fff',
                    borderColor: theme.palette.secondary.main,
                  },
                }
              : {}),
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24 }}>
            <Box component="span" sx={{ position: 'absolute', opacity: saved ? 0 : 1, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}>
              Save
            </Box>
            <Box component="span" sx={{ position: 'absolute', opacity: saved ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-flex', pointerEvents: 'none' }}>
              <CheckIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default ShopTheCollectionAdmin;
