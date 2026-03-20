import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
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

type DraftValues = { title: string; description: string; price: string; dimensions: string };

/** Last index in sort order for this color → highest sort_order among matching images. */
function lastImageIndexForColor(imageColorIds: number[], colorId: number): number {
  let last = -1;
  for (let i = 0; i < imageColorIds.length; i++) {
    if (imageColorIds[i] === colorId) last = i;
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
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creatingStripeCheckout, setCreatingStripeCheckout] = useState<boolean>(false);
  const { isAuthenticated, isAdmin, user, setUserFromPayload } = useAuth();
  const [cinnamonModalOpen, setCinnamonModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingAll, setEditingAll] = useState(false);
  const [draftValues, setDraftValues] = useState<DraftValues>({ title: '', description: '', price: '', dimensions: '' });
  const [draftImageIds, setDraftImageIds] = useState<number[]>([]);
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

        const firstCid = res.product_colors?.[0]?.id ?? res.image_color_ids?.[0] ?? null;
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
  }, [productId]);

  useEffect(() => {
    if (!product?.image_urls?.length) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage((prev) =>
      prev && product.image_urls!.includes(prev) ? prev : product.image_urls![0]
    );
  }, [product?.id, product?.image_urls]);

  const toggleButtonSelectedSx = {
    '& .MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      color: '#fff',
      '&:hover': { backgroundColor: theme.palette.primary.light, opacity: 0.9 },
    },
  };

  const handleColorToggle = (_: React.MouseEvent<HTMLElement>, value: number | null) => {
    if (editingAll || !product?.image_urls?.length) return;
    const cids = product.image_color_ids ?? [];
    if (value == null) return;
    setSelectedColorId(value);
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
    });
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

  return (
    <Box>
      <CinnamonModal
        open={cinnamonModalOpen}
        onClose={() => setCinnamonModalOpen(false)}
        onAnswer={handleCinnamonAnswer}
        loading={creatingStripeCheckout}
      />
      <Grid container>
        <Grid item xs={2} sm={2} md={1} sx={{ display: { sm: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pt: 2 }}>
            {editingAll && product.image_ids?.length ? (
              getDraftImageUrls().map((url, i) => (
                <Box key={draftImageIds[i]} sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.5 }}>
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
                      width: 64,
                      height: 64,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderRadius: 1,
                      border: (theme) => selectedImage === url ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)',
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
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: (t) => (selectedImage === url ? `2px solid ${t.palette.primary.main}` : '1px solid rgba(0,0,0,0.08)'),
                  }}
                />
              ))
            )}
          </Box>
        </Grid>
        <Grid item xs={10} md={4}>
          <Box sx={{ p: 2, pl: 0 }}>
            <CardMedia component="img" height="500" image={selectedImage || product.image_urls?.[0]} alt={product.title} />
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
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<EditIcon />}
                    onClick={startEditAll}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: colors.background.white,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            )}

            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              {editingAll ? (
                <TextField
                  size="small"
                  value={draftValues.title}
                  onChange={(e) => setDraftValues((prev) => ({ ...prev, title: e.target.value }))}
                  fullWidth
                  sx={{ maxWidth: 400 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h6">{product.title}</Typography>
              )}
            </Box>

            {/* Description */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1 }}>
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
                <Typography variant="subtitle1">{product.description ?? '—'}</Typography>
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
                <Typography sx={{ mt: 1 }}>
                  <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}</strong>
                </Typography>
              )}
            </Box>

            {/* Dimensions & Color */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {editingAll ? (
                  <TextField
                    size="small"
                    placeholder="Dimensions"
                    value={draftValues.dimensions}
                    onChange={(e) => setDraftValues((prev) => ({ ...prev, dimensions: e.target.value }))}
                    sx={{ maxWidth: 200 }}
                  />
                ) : (
                  <Typography variant="body2"><strong>Dimensions:</strong> {product.dimensions ?? '—'}</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, pt: 0.5 }}>
                  Color:
                </Typography>
                {!product.product_colors?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                ) : (
                  <ToggleButtonGroup
                    value={selectedColorId}
                    exclusive
                    disabled={editingAll}
                    onChange={handleColorToggle}
                    size="small"
                    sx={toggleButtonSelectedSx}
                  >
                    {product.product_colors.map((c) => (
                      <ToggleButton key={c.id} value={c.id} aria-label={c.name} sx={{ textTransform: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 0.25 }}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: 0.5,
                              flexShrink: 0,
                              bgcolor: c.hex || '#888',
                              border: '1px solid rgba(0,0,0,0.2)',
                            }}
                          />
                          <Typography component="span" variant="body2">
                            {c.name}
                          </Typography>
                        </Box>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
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
                  display: 'flex', flexDirection: 'column', height: '30px', width: '150px',
                  backgroundColor: theme.palette.info.main, color: colors.background.white,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: theme.palette.info.dark,
                  },
                  }}
              >
                  {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button type="button" variant="contained"
                sx={{
                  mt: 1, display: 'flex', flexDirection: 'column', height: '30px', width: '150px',
                  backgroundColor: theme.palette.primary.main, color: colors.background.white,
                  textTransform: 'none',
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
                  const needCinnamonAnswer = user == null || user.allergic_to_cinnamon === undefined || user.allergic_to_cinnamon === null;
                  if (needCinnamonAnswer) {
                    setCinnamonModalOpen(true);
                    return;
                  }
                  try {
                    setCreatingStripeCheckout(true);
                    const data = await createCheckoutSession(
                      product.stripe_price_id,
                      1,
                      user?.allergic_to_cinnamon ?? undefined,
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;
