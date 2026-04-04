import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  getProductById,
  ProductWithImages,
  createCheckoutSession,
  syncCart,
  updateProduct,
  reorderProductImages,
  deleteProductImage,
  updateAllergicToCinnamon,
  getCurrentUser,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import CinnamonModal from '../components/CinnamonModal';

type DraftValues = {
  title: string;
  description: string;
  price: string;
  dimensions: string;
  lead_time: string;
};

type ProductAccordionRowProps = {
  title: string;
  text: string | null | undefined;
};

const ProductAccordionRow: React.FC<ProductAccordionRowProps> = ({ title, text }) => {
  const [open, setOpen] = useState(false);
  const hasContent = Boolean(text && String(text).trim());
  const display = hasContent ? String(text) : '—';

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.12)',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {title}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            color: 'text.secondary',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
          fontSize="small"
        />
      </Box>
      <Collapse in={open}>
        <Typography
          variant="body2"
          component="div"
          sx={{
            whiteSpace: 'pre-wrap',
            pb: 2,
            pt: 0.25,
            color: 'text.secondary',
            lineHeight: 1.7,
          }}
        >
          {display}
        </Typography>
      </Collapse>
    </Box>
  );
};

function lastImageIndexForColor(imageColorIds: number[], colorId: number): number {
  let last = -1;
  for (let i = 0; i < imageColorIds.length; i++) {
    if (imageColorIds[i] === colorId) {
      return i;
    }
  }
  return last;
}

function firstImageUrlForColor(p: ProductWithImages, colorId: number): string | null {
  const urls = p.image_urls ?? [];
  const cids = p.image_color_ids ?? [];
  for (let i = 0; i < urls.length; i++) {
    if (cids[i] === colorId) return urls[i] ?? null;
  }
  return urls[0] ?? null;
}

function resolveCheckoutColorId(p: ProductWithImages, selectedColorId: number | null): number | null {
  if (selectedColorId != null) return selectedColorId;
  return p.product_colors?.[0]?.id ?? p.image_color_ids?.[0] ?? null;
}

const ProductDetail: React.FC = () => {
  const theme = useTheme();
  const { productId } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creatingStripeCheckout, setCreatingStripeCheckout] = useState<boolean>(false);
  const { isAuthenticated, isAdmin, user, setUserFromPayload } = useAuth();
  const [cinnamonModalOpen, setCinnamonModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingAll, setEditingAll] = useState(false);
  const [draftValues, setDraftValues] = useState<DraftValues>({
    title: '',
    description: '',
    price: '',
    dimensions: '',
    lead_time: '',
  });
  const [draftImageIds, setDraftImageIds] = useState<number[]>([]);
  const [draftIsActive, setDraftIsActive] = useState<boolean>(true);
  const [savingAll, setSavingAll] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    const id = Number(productId);
    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res);
        setError(null);

        const stateCidRaw = (location.state as { selectedColorId?: number | null } | null)?.selectedColorId;
        const stateCid = typeof stateCidRaw === 'number' ? stateCidRaw : null;
        const validColorIds = new Set<number>([
          ...(res.product_colors?.map((c) => c.id) ?? []),
          ...(res.image_color_ids ?? []),
        ]);
        const firstCid = stateCid != null && validColorIds.has(stateCid)
          ? stateCid
          : (res.product_colors?.[0]?.id ?? res.image_color_ids?.[0] ?? null);
        setSelectedColorId(firstCid);
        if (!res.image_urls?.length) {
          setSelectedImage(null);
          return;
        }
        if (firstCid == null) {
          setSelectedImage(res.image_urls[0] ?? null);
          return;
        }
        const cids = res.image_color_ids ?? [];
        const idx = lastImageIndexForColor(cids, firstCid);
        setSelectedImage(idx >= 0 ? res.image_urls[idx] : res.image_urls[0]);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || err.message || 'Failed to load product');
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId, location.state]);

  useEffect(() => {
    if (!product?.image_urls?.length) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage((prev) =>
      prev && product.image_urls!.includes(prev) ? prev : product.image_urls![0]
    );
  }, [product?.id, product?.image_urls]);

  const handleColorSelect = (value: number) => {
    if (editingAll || !product?.image_urls?.length) return;
    setSelectedColorId(value);
    const cids = product.image_color_ids ?? [];
    const idx = lastImageIndexForColor(cids, value);
    setSelectedImage(idx >= 0 ? product.image_urls[idx] : product.image_urls[0]);
  };

  const startEditAll = () => {
    if (!product) return;
    setDraftValues({
      title: String(product.title ?? ''),
      description: String(product.description ?? ''),
      price: String(product.price ?? ''),
      dimensions: String(product.dimensions ?? ''),
      lead_time: String(product.lead_time ?? ''),
    });
    setDraftIsActive(Boolean(product.is_active));
    setDraftImageIds(product.image_ids ? [...product.image_ids] : []);
    setEditingAll(true);
  };

  const idToUrl = (p: ProductWithImages): Record<number, string> => {
    if (!p.image_ids || !p.image_urls) return {};
    return Object.fromEntries(p.image_ids.map((id, i) => [id, p.image_urls![i]]));
  };

  const getDraftImageUrls = (): string[] => {
    if (!product) return [];
    const map = idToUrl(product);
    return draftImageIds.map((id) => map[id]).filter(Boolean);
  };

  const moveImageUp = (index: number) => {
    if (index <= 0) return;
    setDraftImageIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveImageDown = (index: number) => {
    if (index >= draftImageIds.length - 1) return;
    setDraftImageIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removeDraftImage = (index: number) => {
    if (!product) return;
    const map = idToUrl(product);
    const removedUrl = map[draftImageIds[index]];
    setDraftImageIds((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedImage === removedUrl) {
        const firstRemaining = next.length ? map[next[0]] : null;
        setSelectedImage(firstRemaining ?? null);
      }
      return next;
    });
  };

  const cancelEditAll = () => {
    setEditingAll(false);
  };

  const saveEditAll = async () => {
    if (!product) return;
    const num = parseFloat(draftValues.price);
    if (Number.isNaN(num) || num < 0) {
      alert('Enter a valid price');
      return;
    }
    setSavingAll(true);
    try {
      let updated = await updateProduct(product.id, {
        title: draftValues.title,
        description: draftValues.description,
        price: num,
        dimensions: draftValues.dimensions,
        lead_time: draftValues.lead_time,
        is_active: draftIsActive,
      });
      const originalIds = product.image_ids ?? [];
      const deletedIds = originalIds.filter((id) => !draftImageIds.includes(id));
      for (const id of deletedIds) {
        updated = await deleteProductImage(updated.id, id);
      }
      if (draftImageIds.length > 0) {
        updated = await reorderProductImages(updated.id, draftImageIds);
      }
      setProduct(updated);
      if (updated.image_urls?.length && !updated.image_urls.includes(selectedImage ?? '')) {
        setSelectedImage(updated.image_urls[0]);
      }
      setEditingAll(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    } finally {
      setSavingAll(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  const handleCinnamonAnswer = async (allergic: boolean) => {
    if (!product?.stripe_price_id) return;
    const cid = resolveCheckoutColorId(product, selectedColorId);
    if (cid == null) {
      alert('This product has no color for checkout. Add photos with colors first.');
      return;
    }
    setCreatingStripeCheckout(true);
    try {
      if (user) {
        await updateAllergicToCinnamon(allergic);
        const u = await getCurrentUser();
        setUserFromPayload(u);
      }
      const data = await createCheckoutSession(product.stripe_price_id, 1, allergic, cid);
      setCinnamonModalOpen(false);
      if (data?.url) window.location.href = data.url;
      else alert((data && (data as any).error) || 'Failed to create checkout session');
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setCreatingStripeCheckout(false);
    }
  };

  const thumbImgSx = {
    width: 64,
    height: 64,
    objectFit: 'cover' as const,
    cursor: 'pointer' as const,
    borderRadius: 1,
  };

  const renderThumbnailColumn = (placement: 'sidebar' | 'below') => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: placement === 'sidebar' ? 'column' : 'row',
        flexWrap: placement === 'below' ? 'wrap' : 'nowrap',
        alignItems: placement === 'sidebar' ? 'flex-end' : 'center',
        justifyContent: placement === 'below' ? 'center' : 'flex-start',
        pt: placement === 'sidebar' ? 2 : 0,
        ...(placement === 'below' ? { mt: 2, px: 1 } : {}),
      }}
    >
      {editingAll && product.image_ids?.length ? (
        getDraftImageUrls().map((url, i) => (
          <Box
            key={draftImageIds[i]}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              mb: placement === 'sidebar' ? 0.5 : 0,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <IconButton
                size="small"
                onClick={() => moveImageUp(i)}
                disabled={i === 0}
                aria-label="Move up"
                sx={{ p: 0.25, minWidth: 0, width: 24, height: 24 }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => moveImageDown(i)}
                disabled={i === draftImageIds.length - 1}
                aria-label="Move down"
                sx={{ p: 0.25, minWidth: 0, width: 24, height: 24 }}
              >
                <ArrowDownwardIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <IconButton
              size="small"
              onClick={() => removeDraftImage(i)}
              aria-label="Delete image"
              sx={{ p: 0.25, minWidth: 0, width: 24, height: 24 }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Box
              component="img"
              src={url}
              onClick={() => setSelectedImage(url)}
              sx={{
                ...thumbImgSx,
                border: (th) => (selectedImage === url ? `2px solid ${th.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)'),
              }}
            />
          </Box>
        ))
      ) : (
        product.image_urls?.map((url, i) => (
          <Box
            key={i}
            component="img"
            src={url}
            onClick={() => {
              const firstCid = product.product_colors?.[0]?.id ?? product.image_color_ids?.[0] ?? null;
              const nextCid = (product.image_color_ids ?? [])[i] ?? firstCid;
              if (nextCid != null) setSelectedColorId(nextCid);
              setSelectedImage(url);
            }}
            sx={{
              ...thumbImgSx,
              border: (t) => (selectedImage === url ? `2px solid ${t.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)'),
            }}
          />
        ))
      )}
    </Box>
  );

  return (
    <Box>
      <CinnamonModal
        open={cinnamonModalOpen}
        onClose={() => setCinnamonModalOpen(false)}
        onAnswer={handleCinnamonAnswer}
        loading={creatingStripeCheckout}
      />
      <Grid container>
        <Grid item md={1} sx={{ display: { xs: 'none', md: 'block' } }}>
          {renderThumbnailColumn('sidebar')}
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, pl: { xs: 2, md: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <CardMedia
                component="img"
                image={selectedImage || product.image_urls?.[0]}
                alt={product.title}
                sx={{
                  height: { xs: 360, md: 500 },
                  width: { xs: '90%',md: '100%' },
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>{renderThumbnailColumn('below')}</Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ p: 2, position: 'relative' }}>
            {isAdmin() && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {editingAll ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={saveEditAll}
                      disabled={savingAll}
                      aria-label="Save"
                      sx={{
                        color: colors.background.white,
                        backgroundColor: theme.palette.primary.main,
                        width: 36,
                        height: 36,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={cancelEditAll}
                      disabled={savingAll}
                      aria-label="Cancel"
                      sx={{
                        color: colors.background.white,
                        backgroundColor: theme.palette.primary.main,
                        width: 36,
                        height: 36,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      onClick={startEditAll}
                      aria-label="Edit product"
                      sx={{
                        display: { xs: 'inline-flex', md: 'none' },
                        color: colors.background.white,
                        backgroundColor: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<EditIcon />}
                      onClick={startEditAll}
                      sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                        backgroundColor: theme.palette.primary.main,
                        color: colors.background.white,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                      }}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {/* Title */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: editingAll ? 'flex-start' : 'center',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    width: '100%',
                  }}
                >
                  {editingAll ? (
                    <TextField
                      size="small"
                      value={draftValues.title}
                      onChange={(e) => setDraftValues((prev) => ({ ...prev, title: e.target.value }))}
                      sx={{
                        width: '70vw',
                        maxWidth: '100%',
                      }}
                      autoFocus
                    />
                  ) : (
                    <Typography variant="h4">{product.title}</Typography>
                  )}
                </Box>

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {editingAll ? (
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ step: '0.01', min: 0 }}
                      value={draftValues.price}
                      onChange={(e) => setDraftValues((prev) => ({ ...prev, price: e.target.value }))}
                      sx={{ maxWidth: 120 }}
                    />
                  ) : (
                    <Typography sx={{ mt: 1, fontSize: '1.2em' }}>
                      <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</strong>
                    </Typography>
                  )}
                </Box>

                {/* Color */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                    {!product.product_colors?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    ) : (
                      <FormControl size="small" sx={{ minWidth: 240 }}>
                        <Select
                          value={selectedColorId ?? product.product_colors[0].id}
                          disabled={editingAll}
                          onChange={(e) => handleColorSelect(Number(e.target.value))}
                          sx={{ textTransform: 'none' }}
                        >
                          {product.product_colors.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                    bgcolor: c.hex || '#888',
                                    border: '1px solid rgba(0,0,0,0.2)',
                                    fontSize: '1.2rem'
                                  }}
                                />
                                <Typography component="span" variant="body2" sx={{ fontSize: '1em' }}>
                                  {c.name}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </Box>

                {/* Description */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 2 }}>
                  {editingAll ? (
                    <TextField
                      size="small"
                      value={draftValues.description}
                      onChange={(e) => setDraftValues((prev) => ({ ...prev, description: e.target.value }))}
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ maxWidth: 500 }}
                    />
                  ) : (
                    <Typography variant="subtitle1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {product.description ?? '—'}
                    </Typography>
                  )}
                </Box>

                {/* Product Details + Lead Time (accordions) */}
                {editingAll ? (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
                    <TextField
                      size="small"
                      label="Product Details"
                      value={draftValues.dimensions}
                      onChange={(e) => setDraftValues((prev) => ({ ...prev, dimensions: e.target.value }))}
                      fullWidth
                      multiline
                      minRows={3}
                    />
                    <TextField
                      size="small"
                      label="Lead Time"
                      value={draftValues.lead_time}
                      onChange={(e) => setDraftValues((prev) => ({ ...prev, lead_time: e.target.value }))}
                      fullWidth
                      multiline
                      minRows={3}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      maxWidth: 560,
                      borderTop: '1px solid',
                      borderColor: 'rgba(0,0,0,0.12)',
                    }}
                  >
                    <ProductAccordionRow title="Product Details" text={product.dimensions} />
                    <ProductAccordionRow title="Lead Time" text={product.lead_time} />
                  </Box>
                )}

                {editingAll && (
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={draftIsActive}
                          onChange={(e) => setDraftIsActive(e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  </Box>
                )}

              </Grid>
              <Grid item md={1}></Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    mt: { xs: 0, md: 8 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { md: 'flex-start' },
                  }}
                >
                  <Button type="button" variant="contained"
                    size='large'
                      onClick={async () => {
                        if (adding) return;
                        const cid = resolveCheckoutColorId(product, selectedColorId);
                        if (cid == null) {
                          alert('This product has no color for the cart. Add photos with colors first.');
                          return;
                        }
                        const colorMeta = product.product_colors?.find((c) => c.id === cid);
                        setAdding(true);
                        try {
                          const item = {
                            id: `${product.id}-${cid}`,
                            product_id: product.id,
                            product_title: product.title,
                            image_url: firstImageUrlForColor(product, cid),
                            quantity: 1,
                            price_cents: Math.round(product.price * 100),
                            color_id: cid,
                            color_name: colorMeta?.name,
                            color_hex: colorMeta?.hex,
                          };

                          const raw = localStorage.getItem('cart');
                          let cart: any = { items: [] };
                          if (raw) {
                            try { const parsed = JSON.parse(raw); cart.items = parsed.items || parsed || []; } catch (e) { cart.items = []; }
                          }
                          const existing = cart.items.find((i: any) => i.product_id === item.product_id && i.color_id === cid);
                          if (existing) existing.quantity = (existing.quantity || 0) + 1;
                          else cart.items.unshift(item);
                          localStorage.setItem('cart', JSON.stringify(cart));
                          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: cart.items } }));

                          if (isAuthenticated) {
                            try { await syncCart(cart.items); } catch (e) { console.warn('Cart sync failed', e); }
                          }
                        } finally { setAdding(false); }
                      }}
                      sx={{
                      display: 'flex', flexDirection: 'column', height: '50px', width: '150px',
                      backgroundColor: theme.palette.info.main, color: colors.background.white,
                      textTransform: 'none',
                      fontSize: '1.1em',
                      '&:hover': {
                        backgroundColor: theme.palette.info.dark,
                      },
                      }}
                  >
                      {adding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button type="button" variant="contained"
                    sx={{
                      mt: 1, display: 'flex', flexDirection: 'column', height: '50px', width: '150px',
                      backgroundColor: theme.palette.primary.main, color: colors.background.white,
                      textTransform: 'none', 
                      fontSize: '1.1em',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={async () => {
                      if (!product || !product.stripe_price_id) {
                        alert('No price configured for this product');
                        return;
                      }
                      const cid = resolveCheckoutColorId(product, selectedColorId);
                      if (cid == null) {
                        alert('This product has no color for checkout. Add photos with colors first.');
                        return;
                      }
                      // const needCinnamonAnswer = user == null || user.allergic_to_cinnamon === undefined || user.allergic_to_cinnamon === null;
                      // if (needCinnamonAnswer) {
                      //   setCinnamonModalOpen(true);
                      //   return;
                      // }
                      try {
                        setCreatingStripeCheckout(true);
                        const data = await createCheckoutSession(
                          product.stripe_price_id,
                          1,
                          undefined,
                          cid
                        );
                        if (data && data.url) window.location.href = data.url;
                        else {
                          console.error(data);
                          alert((data && data.error) || 'Failed to create checkout session');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Network error');
                      } finally {
                        setCreatingStripeCheckout(false);
                      }
                    }}
                  >
                    {creatingStripeCheckout ? <CircularProgress size={18} sx={{ color: colors.background.white }} /> : 'Buy Now'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;
