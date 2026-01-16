import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getProductTypes } from '../services/api';
import type { ProductType } from '../services/api';

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
    color: '',
  });
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const pts = await getProductTypes();
        if (mounted) setProductTypes(pts || []);
      } catch (err) {
        console.error('Failed to load product types', err);
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
  };

  const handleCreateSubmit = async () => {
    if (!form.title || !form.price || !form.description || !form.product_type_id || !form.dimensions || !form.color) return alert('Please provide all required fields');
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      const priceVal = Number(form.price || 0);
      fd.append('price', priceVal.toFixed(2));
      fd.append('description', form.description);
      fd.append('product_type_id', String(form.product_type_id || '1'));
      fd.append('dimensions', form.dimensions);
      fd.append('color', form.color);
      formFiles.forEach((f) => fd.append('images', f));

      const res = await fetch('/api/products/create', { method: 'POST', body: fd });
      if (res.ok) {
        const created = await res.json();
        onCreated && onCreated(created);
        onClose();
        setForm({ title: '', price: '', description: '', product_type_id: '', dimensions: '', color: '' });
        setFormFiles([]);
      } else {
        console.error('Failed to create product', await res.text());
        alert('Failed to create product');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating product');
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
          <TextField label="Color" value={form.color} onChange={handleFormChange('color')} fullWidth />
          <input type="file" multiple accept="image/*" onChange={handleFilesChange} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>Cancel</Button>
        <Button variant="contained" onClick={handleCreateSubmit} disabled={creating}>{creating ? 'Creating…' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCreateDialog;
