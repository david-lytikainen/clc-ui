import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  getBannerPictures,
  saveBannerPictures,
  getFooterPictures,
  saveFooterPictures,
  type BannerPictureItem,
  type BannerSlotValue,
  type FooterPictureItem,
  type FooterSlotValue,
} from '../../services/api';

const SAVED_FEEDBACK_MS = 1500;
const SLOT_HEIGHT = 180;

const emptyInitialSlots: (BannerPictureItem | null)[] = [null, null, null];
const emptyDraftSlots: (BannerSlotValue | null)[] = [null, null, null];
const emptyInitialFooterSlots: (FooterPictureItem | null)[] = [null, null];
const emptyDraftFooterSlots: (FooterSlotValue | null)[] = [null, null];

function slotToSavePayload(
  v: BannerSlotValue | null
): BannerPictureItem | { file: File } | null {
  if (v === null) return null;
  if ('file' in v && v.file) return { file: v.file };
  return v as BannerPictureItem;
}

function slotsEqual(
  initial: (BannerPictureItem | null)[],
  draft: (BannerSlotValue | null)[]
): boolean {
  if (initial.length !== draft.length) return false;
  for (let i = 0; i < initial.length; i++) {
    const a = initial[i];
    const b = draft[i];
    if (a === null && b === null) continue;
    if (a === null || b === null) return false;
    if ('file' in b && b.file) return false; // draft has new file = change
    if ((b as BannerPictureItem).id !== a.id) return false;
  }
  return true;
}

function buildInitialSlots(list: BannerPictureItem[]): (BannerPictureItem | null)[] {
  const slots: (BannerPictureItem | null)[] = [null, null, null];
  for (const p of list) {
    if (p.banner_index >= 0 && p.banner_index <= 2) {
      slots[p.banner_index] = p;
    }
  }
  return slots;
}

function footerSlotToSavePayload(
  v: FooterSlotValue | null
): FooterPictureItem | { file: File } | null {
  if (v === null) return null;
  if ('file' in v && v.file) return { file: v.file };
  return v as FooterPictureItem;
}

function footerSlotsEqual(
  initial: (FooterPictureItem | null)[],
  draft: (FooterSlotValue | null)[]
): boolean {
  if (initial.length !== draft.length) return false;
  for (let i = 0; i < initial.length; i++) {
    const a = initial[i];
    const b = draft[i];
    if (a === null && b === null) continue;
    if (a === null || b === null) return false;
    if ('file' in b && b.file) return false;
    if ((b as FooterPictureItem).id !== a.id) return false;
  }
  return true;
}

function buildInitialFooterSlots(list: FooterPictureItem[]): (FooterPictureItem | null)[] {
  const slots: (FooterPictureItem | null)[] = [null, null];
  for (const p of list) {
    if (p.footer_index === 0 || p.footer_index === 1) {
      slots[p.footer_index] = p;
    }
  }
  return slots;
}

const HomeAdmin: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [initialSlots, setInitialSlots] = useState<(BannerPictureItem | null)[]>(emptyInitialSlots);
  const [draftSlots, setDraftSlots] = useState<(BannerSlotValue | null)[]>(emptyDraftSlots);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [initialFooterSlots, setInitialFooterSlots] = useState<(FooterPictureItem | null)[]>(emptyInitialFooterSlots);
  const [draftFooterSlots, setDraftFooterSlots] = useState<(FooterSlotValue | null)[]>(emptyDraftFooterSlots);
  const [savingFooter, setSavingFooter] = useState(false);
  const [savedFooter, setSavedFooter] = useState(false);
  const savedFooterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRefsFooter = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getBannerPictures(), getFooterPictures()])
      .then(([bannerList, footerList]) => {
        const slots = buildInitialSlots(bannerList);
        setInitialSlots(slots);
        setDraftSlots([...slots]);
        const footerSlots = buildInitialFooterSlots(footerList);
        setInitialFooterSlots(footerSlots);
        setDraftFooterSlots([...footerSlots]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    if (savedFooterTimeoutRef.current) clearTimeout(savedFooterTimeoutRef.current);
  }, []);

  const hasChanges = !slotsEqual(initialSlots, draftSlots);

  const handleSave = () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    const payload = draftSlots.map(slotToSavePayload);
    saveBannerPictures(payload)
      .then((list) => {
        const slots = buildInitialSlots(list);
        setInitialSlots(slots);
        setDraftSlots([...slots]);
        setSaved(true);
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setSaved(false), SAVED_FEEDBACK_MS);
        window.dispatchEvent(new CustomEvent('bannerPicturesUpdated'));
      })
      .catch(() => alert('Failed to save banner pictures'))
      .finally(() => setSaving(false));
  };

  const handleCancel = () => {
    setDraftSlots([...initialSlots]);
  };

  const handleAddClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDraftSlots((prev) => {
      const next = [...prev];
      const prevVal = next[index];
      if (prevVal && 'previewUrl' in prevVal) URL.revokeObjectURL(prevVal.previewUrl);
      next[index] = { file, previewUrl };
      return next;
    });
    e.target.value = '';
  };

  const removeSlot = (index: number) => {
    setDraftSlots((prev) => {
      const next = [...prev];
      const v = next[index];
      if (v && 'previewUrl' in v) URL.revokeObjectURL(v.previewUrl);
      next[index] = null;
      return next;
    });
  };

  const moveLeft = (index: number) => {
    if (index <= 0) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveRight = (index: number) => {
    if (index >= 2) return;
    setDraftSlots((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const getSlotImageUrl = (v: BannerSlotValue | null): string | null => {
    if (!v) return null;
    if ('image_url' in v) return v.image_url;
    return (v as { file: File; previewUrl: string }).previewUrl;
  };

  const hasFooterChanges = !footerSlotsEqual(initialFooterSlots, draftFooterSlots);

  const handleSaveFooter = () => {
    if (!hasFooterChanges || savingFooter) return;
    setSavingFooter(true);
    const payload = draftFooterSlots.map(footerSlotToSavePayload);
    saveFooterPictures(payload)
      .then((list) => {
        const slots = buildInitialFooterSlots(list);
        setInitialFooterSlots(slots);
        setDraftFooterSlots([...slots]);
        setSavedFooter(true);
        if (savedFooterTimeoutRef.current) clearTimeout(savedFooterTimeoutRef.current);
        savedFooterTimeoutRef.current = setTimeout(() => setSavedFooter(false), SAVED_FEEDBACK_MS);
      })
      .catch(() => alert('Failed to save footer pictures'))
      .finally(() => setSavingFooter(false));
  };

  const handleCancelFooter = () => {
    setDraftFooterSlots([...initialFooterSlots]);
  };

  const handleAddClickFooter = (index: number) => {
    fileInputRefsFooter.current[index]?.click();
  };

  const handleFileChangeFooter = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDraftFooterSlots((prev) => {
      const next = [...prev];
      const prevVal = next[index];
      if (prevVal && 'previewUrl' in prevVal) URL.revokeObjectURL(prevVal.previewUrl);
      next[index] = { file, previewUrl };
      return next;
    });
    e.target.value = '';
  };

  const removeFooterSlot = (index: number) => {
    setDraftFooterSlots((prev) => {
      const next = [...prev];
      const v = next[index];
      if (v && 'previewUrl' in v) URL.revokeObjectURL(v.previewUrl);
      next[index] = null;
      return next;
    });
  };

  const moveFooterLeft = (index: number) => {
    if (index <= 0) return;
    setDraftFooterSlots((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveFooterRight = (index: number) => {
    if (index >= 1) return;
    setDraftFooterSlots((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const getFooterSlotImageUrl = (v: FooterSlotValue | null): string | null => {
    if (!v) return null;
    if ('image_url' in v) return v.image_url;
    return (v as { file: File; previewUrl: string }).previewUrl;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, }}>
        Banner Pictures
      </Typography>
      <Grid container sx={{ }}>
        <Grid item xs={1} />
        {[0, 1, 2].map((index) => (
          <Grid item xs={3} key={index}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                Picture {index + 1}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: SLOT_HEIGHT,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getSlotImageUrl(draftSlots[index]) ? (
                  <Box
                    component="img"
                    src={getSlotImageUrl(draftSlots[index])!}
                    alt=""
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <>
                    <input
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, e)}
                      style={{ display: 'none' }}
                    />
                    <Box
                      onClick={() => handleAddClick(index)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <AddIcon sx={{ color: 'text.secondary', fontSize: 48 }} />
                    </Box>
                  </>
                )}
              </Box>
              {draftSlots[index] && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => moveLeft(index)}
                    disabled={index === 0}
                    aria-label="Move left"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveRight(index)}
                    disabled={index === 2}
                    aria-label="Move right"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeSlot(index)}
                    aria-label="Remove image"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleSave}
          disabled={!hasChanges || saving}
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
        <Button onClick={handleCancel} disabled={!hasChanges || saving}>
          Cancel
        </Button>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4 }}>
        Footer Pictures
      </Typography>
      <Grid container sx={{ }}>
        <Grid item xs={1} />
        {[0, 1].map((index) => (
          <Grid item xs={3} sm={3} md={3} lg={3} key={index}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                Picture {index + 1}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: SLOT_HEIGHT,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getFooterSlotImageUrl(draftFooterSlots[index]) ? (
                  <Box
                    component="img"
                    src={getFooterSlotImageUrl(draftFooterSlots[index])!}
                    alt=""
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <>
                    <input
                      ref={(el) => { fileInputRefsFooter.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChangeFooter(index, e)}
                      style={{ display: 'none' }}
                    />
                    <Box
                      onClick={() => handleAddClickFooter(index)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <AddIcon sx={{ color: 'text.secondary', fontSize: 48 }} />
                    </Box>
                  </>
                )}
              </Box>
              {draftFooterSlots[index] && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => moveFooterLeft(index)}
                    disabled={index === 0}
                    aria-label="Move left"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveFooterRight(index)}
                    disabled={index === 1}
                    aria-label="Move right"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeFooterSlot(index)}
                    aria-label="Remove image"
                    sx={{ p: 0.25, minWidth: 0, width: 32, height: 32 }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleSaveFooter}
          disabled={!hasFooterChanges || savingFooter}
          sx={{
            minWidth: 72,
            height: 40,
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            ...(savedFooter
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
            <Box component="span" sx={{ position: 'absolute', opacity: savedFooter ? 0 : 1, transition: 'opacity 0.25s ease', pointerEvents: 'none' }}>
              Save
            </Box>
            <Box component="span" sx={{ position: 'absolute', opacity: savedFooter ? 1 : 0, transition: 'opacity 0.25s ease', display: 'inline-flex', pointerEvents: 'none' }}>
              <CheckIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        </Button>
        <Button onClick={handleCancelFooter} disabled={!hasFooterChanges || savingFooter}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default HomeAdmin;
