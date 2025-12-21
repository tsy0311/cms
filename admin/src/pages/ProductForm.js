import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    category: '',
    stock: '',
    status: 'active',
    featured: false,
    sizes: [],
    colors: [],
    images: [],
  });
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' });
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        sku: product.sku || '',
        category: product.category?._id || '',
        stock: product.stock || '',
        status: product.status || 'draft',
        featured: product.featured || false,
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images || [],
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addSize = () => {
    if (sizeInput && !formData.sizes.includes(sizeInput)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, sizeInput]
      });
      setSizeInput('');
    }
  };

  const removeSize = (size) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(s => s !== size)
    });
  };

  const addColor = () => {
    if (colorInput.name && !formData.colors.find(c => c.name === colorInput.name)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { ...colorInput }]
      });
      setColorInput({ name: '', hex: '#000000' });
    }
  };

  const removeColor = (colorName) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter(c => c.name !== colorName)
    });
  };

  const handleOpenCategoryDialog = () => {
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setNewCategoryName('');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      const response = await axios.post('/api/categories', {
        name: newCategoryName.trim(),
        isActive: true
      });
      
      const newCategory = response.data.data;
      
      // Add new category to the list
      setCategories([...categories, newCategory]);
      
      // Automatically select the newly created category
      setFormData({
        ...formData,
        category: newCategory._id
      });
      
      handleCloseCategoryDialog();
      alert('Category created and selected successfully!');
    } catch (error) {
      alert('Error creating category: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        
        return axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      });

      const responses = await Promise.all(uploadPromises);
      const uploadedImages = responses.map(res => ({
        url: res.data.data.url,
        alt: ''
      }));

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      });

      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      alert('Error uploading image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleImageAltChange = (index, alt) => {
    const updatedImages = [...formData.images];
    updatedImages[index].alt = alt;
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`/api/products/${id}`, formData);
        alert('Product updated successfully!');
      } else {
        await axios.post('/api/products', formData);
        alert('Product created successfully!');
      }
      navigate('/products');
    } catch (error) {
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Product' : 'New Product'}
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  select
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCategoryDialog}
                  sx={{ minWidth: 'auto', px: 2, whiteSpace: 'nowrap' }}
                  title="Create New Category"
                >
                  New
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                select
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Compare At Price"
                name="compareAtPrice"
                type="number"
                value={formData.compareAtPrice}
                onChange={handleChange}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                inputProps={{ min: '0' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Product Images
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                    sx={{ mb: 2 }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </label>
              </Box>
              {formData.images.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        p: 1,
                        width: 150,
                        height: 150
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'white',
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        placeholder="Image alt text"
                        value={image.alt || ''}
                        onChange={(e) => handleImageAltChange(index, e.target.value)}
                        sx={{ mt: 1, width: '100%' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Sizes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.sizes.map((size) => (
                  <Box
                    key={size}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      padding: '0.5rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      background: '#f5f5f5'
                    }}
                  >
                    <span>{size}</span>
                    <Button
                      size="small"
                      onClick={() => removeSize(size)}
                      sx={{ minWidth: 'auto', padding: '0.25rem' }}
                    >
                      ×
                    </Button>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="XS, S, M, L, XL, XXL"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <Button onClick={addSize} variant="outlined">
                  Add Size
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {formData.colors.map((color, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      padding: '0.5rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      background: '#f5f5f5'
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: color.hex || '#000',
                        border: '1px solid #ddd'
                      }}
                    />
                    <span>{color.name}</span>
                    <Button
                      size="small"
                      onClick={() => removeColor(color.name)}
                      sx={{ minWidth: 'auto', padding: '0.25rem' }}
                    >
                      ×
                    </Button>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Color name"
                  value={colorInput.name}
                  onChange={(e) => setColorInput({ ...colorInput, name: e.target.value })}
                />
                <TextField
                  size="small"
                  type="color"
                  value={colorInput.hex}
                  onChange={(e) => setColorInput({ ...colorInput, hex: e.target.value })}
                  sx={{ width: 80 }}
                />
                <Button onClick={addColor} variant="outlined">
                  Add Color
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ mr: 2 }}>
                {id ? 'Update' : 'Create'} Product
              </Button>
              <Button variant="outlined" onClick={() => navigate('/products')}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Create Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create New Category
          <IconButton
            aria-label="close"
            onClick={handleCloseCategoryDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateCategory();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained" color="primary">
            Create Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

