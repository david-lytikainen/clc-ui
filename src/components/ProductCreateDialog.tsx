import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  List,
  ListItem,
  IconButton,
  Typography,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { getProductTypes, getCatalogColors, createProduct } from '../services/api';
import type { ProductType, CatalogColor } from '../services/api';

type ImageColorSelection = number | '';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (product: any) => void;
};

const ProductCreateDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    price: '00.00',
    description: '',
    product_type_id: '',
    dimensions: '',
  });
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [imageColorIds, setImageColorIds] = useState<ImageColorSelection[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [catalogColors, setCatalogColors] = useState<CatalogColor[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const [pts, cols] = await Promise.all([getProductTypes(), getCatalogColors()]);
        if (mounted) {
          setProductTypes(pts || []);
          setCatalogColors(cols || []);
        }
      } catch (err) {
        console.error('Failed to load product types or colors', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  const handleFormChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormFiles(files);
    setImageColorIds(files.map(() => ''));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const j = direction === 'up' ? index - 1 : index + 1;
    setFormFiles((prev) => {
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
    setImageColorIds((prev) => {
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFormFiles((prev) => prev.filter((_, i) => i !== index));
    setImageColorIds((prev) => prev.filter((_, i) => i !== index));
  };

  const setColorAtIndex = (index: number, value: ImageColorSelection) => {
    setImageColorIds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const missingImageColors =
    formFiles.length > 0 &&
    (imageColorIds.length !== formFiles.length || imageColorIds.some((id) => id === '' || id == null));

  const handleCreateSubmit = async () => {
    if (!form.title || !form.price || !form.description || !form.product_type_id || !form.dimensions) {
      return alert('Please provide all required fields');
    }
    if (missingImageColors) {
      return alert('Select a catalog color for each uploaded image');
    }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      const priceVal = Number(form.price || 0);
      fd.append('price', priceVal.toFixed(2));
      fd.append('description', form.description);
      fd.append('product_type_id', String(form.product_type_id || '1'));
      fd.append('dimensions', form.dimensions);
      formFiles.forEach((f) => fd.append('images', f));
      imageColorIds.forEach((cid) => {
        if (typeof cid === 'number') fd.append('image_color_ids', String(cid));
      });

      const created = await createProduct(fd);
      onCreated && onCreated(created);
      onClose();
      setForm({ title: '', price: '', description: '', product_type_id: '', dimensions: '' });
      setFormFiles([]);
      setImageColorIds([]);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        const d = err.response.data as { error?: string; missing?: string[]; message?: string };
        const missing = d.missing?.length ? ` (${d.missing.join(', ')})` : '';
        alert((d.error || d.message || 'Error creating product') + missing);
      } else {
        alert('Error creating product');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Product</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" value={form.title} onChange={handleFormChange('title')} fullWidth />
          <TextField
            label="Price"
            type="number"
            inputProps={{ step: '0.01', min: 0 }}
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            onBlur={() => {
              const v = Number(form.price || 0);
              setForm((prev) => ({ ...prev, price: v.toFixed(2) }));
            }}
            fullWidth
          />
          <TextField label="Description" value={form.description} onChange={handleFormChange('description')} fullWidth multiline rows={3} />
          <FormControl fullWidth>
            <InputLabel id="product-type-label">Product Type</InputLabel>
            <Select
              labelId="product-type-label"
              label="Product Type"
              value={form.product_type_id}
              onChange={(e) => setForm((prev) => ({ ...prev, product_type_id: String((e.target as HTMLInputElement).value) }))}
            >
              {productTypes.map((pt) => (
                <MenuItem key={pt.id} value={String(pt.id)}>{pt.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Dimensions" value={form.dimensions} onChange={handleFormChange('dimensions')} fullWidth />

          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Upload images
            </Button>
            {formFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sort order (first = primary image)
                </Typography>
                <List dense disablePadding sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                  {formFiles.map((file, index) => (
                    <ListItem
                      key={`${file.name}-${index}`}
                      alignItems="flex-start"
                      secondaryAction={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <IconButton
                            size="small"
                            aria-label="Move up"
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label="Move down"
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === formFiles.length - 1}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label="Remove" onClick={() => removeFile(index)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      sx={{ pr: 16, display: 'block' }}
                    >
                      <Typography variant="body2" noWrap sx={{ pr: 6 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25 }}>
                        {index === 0 ? 'Primary' : `#${index + 1}`}
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mt: 1, maxWidth: 'calc(100% - 48px)' }}>
                        <InputLabel id={`image-color-label-${index}`}>Color</InputLabel>
                        <Select
                          labelId={`image-color-label-${index}`}
                          label="Image color"
                          value={imageColorIds[index] === '' ? '' : String(imageColorIds[index])}
                          onChange={(e) => {
                            const v = e.target.value;
                            setColorAtIndex(index, v === '' ? '' : Number(v));
                          }}
                          required
                        >
                          {catalogColors.map((c) => (
                            <MenuItem key={c.id} value={String(c.id)}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                    bgcolor: c.hex || '#888',
                                    border: '1px solid rgba(0,0,0,0.15)',
                                  }}
                                />
                                {c.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreateSubmit}
          disabled={creating || missingImageColors}
        >
          {creating ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCreateDialog;
