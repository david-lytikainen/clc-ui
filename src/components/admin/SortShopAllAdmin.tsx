import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@mui/material/styles';
import { getProductsSortAdmin, saveProductsSortAdmin, type ProductSortRow } from '../../services/api';

const SAVED_FEEDBACK_MS = 1500;

function buildDraft(rows: ProductSortRow[]): (number | null)[] {
  const n = rows.length;
  const draft = Array<number | null>(n).fill(null);
  const bySort = [...rows].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  for (let i = 0; i < bySort.length; i++) draft[i] = bySort[i].id;
  return draft;
}

const SortShopAllAdmin: React.FC<{ active: boolean }> = ({ active }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: number; title: string }[]>([]);
  const [draft, setDraft] = useState<(number | null)[]>([]);
  const [initialDraft, setInitialDraft] = useState<(number | null)[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    getProductsSortAdmin()
      .then((res) => {
        const ordered = [...res.products].sort((a, b) => a.title.localeCompare(b.title));
        setProducts(ordered.map((p) => ({ id: p.id, title: p.title })));
        const built = buildDraft(res.products);
        setDraft(built);
        setInitialDraft(built);
      })
      .finally(() => setLoading(false));
  }, [active]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const moveSlotTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= draft.length || to >= draft.length) return;
    setDraft((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleSave = () => {
    const slots = draft
      .map((productId, idx) => (productId == null ? null : { product_id: productId, sort_order: idx }))
      .filter((x): x is { product_id: number; sort_order: number } => x !== null);
    setSaving(true);
    saveProductsSortAdmin(slots)
      .then((res) => {
        const built = buildDraft(res.products);
        setDraft(built);
        setInitialDraft(built);
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

  if (draft.length === 0) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">No products found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
        {Array.from({ length: draft.length }, (_, i) => (
          <Box
            key={i}
            draggable
            onDragStart={(e) => {
              setDragIndex(i);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (hoverIndex !== i) setHoverIndex(i);
            }}
            onDragEnter={() => setHoverIndex(i)}
            onDrop={() => {
              if (dragIndex == null) return;
              moveSlotTo(dragIndex, i);
              setDragIndex(null);
              setHoverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setHoverIndex(null);
            }}
            sx={{
              flex: '0 0 auto',
              width: {
                xs: 'calc((100% - 1.25rem) / 2)',
                md: 'calc((100% - 3.75rem) / 4)',
                lg: 'calc((100% - 6.25rem) / 6)',
                xl: 'calc((100% - 8.75rem) / 8)',
              },
              border: '1px solid',
              borderColor: dragIndex === i ? 'primary.main' : 'divider',
              borderRadius: 1,
              px: 1.25,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'grab',
              opacity: dragIndex === i ? 0.6 : 1,
              boxShadow: hoverIndex === i && dragIndex !== i ? 'inset 0 0 0 2px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <Typography variant="body2" color="text.secondary" noWrap>
              {products.find((p) => p.id === draft[i])?.title ?? ''}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 4px)', gap: '3px', ml: 1, opacity: 0.7 }}>
              {Array.from({ length: 4 }).map((_, dotIdx) => (
                <Box key={dotIdx} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleSave}
          disabled={saving || !hasChanges}
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

export default SortShopAllAdmin;
