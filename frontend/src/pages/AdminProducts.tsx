import React, { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, IconButton, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { getImagePath, getFallbackImage } from '../utils/imageUtils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  brand?: string;
  image?: string;
  description?: string;
  createdAt: string;
}

const emptyProduct: Product = {
  id: '',
  name: '',
  category: '',
  price: 0,
  brand: '',
  image: '',
  description: '',
  createdAt: '',
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addProduct, setAddProduct] = useState<Product>(emptyProduct);
  const [addLoading, setAddLoading] = useState(false);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        console.error('Admin access required');
        return;
      }
      
      const token = localStorage.getItem('stepstunnerToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}&page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch products:', res.statusText);
        return;
      }
      
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line
  }, [search]);

  // Add product handlers
  const openAdd = () => { setAddProduct(emptyProduct); setAddOpen(true); };
  const closeAdd = () => setAddOpen(false);
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddProduct({ ...addProduct, [e.target.name]: e.target.value });
  };
  const handleAddSave = async () => {
    setAddLoading(true);
    const token = localStorage.getItem('stepstunnerToken');
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addProduct),
    });
    setAddLoading(false);
    closeAdd();
    fetchProducts();
  };

  // Edit product handlers
  const openEdit = (product: Product) => setEditProduct(product);
  const closeEdit = () => setEditProduct(null);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editProduct) return;
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditLoading(true);
    const token = localStorage.getItem('stepstunnerToken');
    await fetch(`/api/admin/products/${editProduct.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editProduct),
    });
    setEditLoading(false);
    closeEdit();
    fetchProducts();
  };

  // Delete product handlers
  const openDelete = (product: Product) => setDeleteProduct(product);
  const closeDelete = () => setDeleteProduct(null);
  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    const token = localStorage.getItem('stepstunnerToken');
    await fetch(`/api/admin/products/${deleteProduct.id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setDeleteLoading(false);
    closeDelete();
    fetchProducts();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Product Management</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search products"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={openAdd} sx={{ backgroundColor: '#d72660', color: 'white', '&:hover': { backgroundColor: '#b71c4a' } }}>
          Add Product
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? <Avatar src={getImagePath(product.image)} alt={product.name} onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage();
                    }} /> : <Avatar>{product.name[0]}</Avatar>}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>Rs {product.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => openDelete(product)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No products found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      {/* Add Product Modal */}
      <Dialog open={addOpen} onClose={closeAdd} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Name" name="name" value={addProduct.name} onChange={handleAddChange} fullWidth />
            <TextField label="Category" name="category" value={addProduct.category} onChange={handleAddChange} fullWidth />
            <TextField label="Brand" name="brand" value={addProduct.brand} onChange={handleAddChange} fullWidth />
            <TextField label="Price" name="price" type="number" value={addProduct.price} onChange={handleAddChange} fullWidth />
            <TextField label="Image URL" name="image" value={addProduct.image} onChange={handleAddChange} fullWidth />
            <TextField label="Description" name="description" value={addProduct.description} onChange={handleAddChange} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd}>Cancel</Button>
          <Button onClick={handleAddSave} variant="contained" disabled={addLoading} sx={{ backgroundColor: '#d72660', color: 'white', '&:hover': { backgroundColor: '#b71c4a' } }}>
            {addLoading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={!!editProduct} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Name" name="name" value={editProduct.name} onChange={handleEditChange} fullWidth />
              <TextField label="Category" name="category" value={editProduct.category} onChange={handleEditChange} fullWidth />
              <TextField label="Brand" name="brand" value={editProduct.brand} onChange={handleEditChange} fullWidth />
              <TextField label="Price" name="price" type="number" value={editProduct.price} onChange={handleEditChange} fullWidth />
              <TextField label="Image URL" name="image" value={editProduct.image} onChange={handleEditChange} fullWidth />
              <TextField label="Description" name="description" value={editProduct.description} onChange={handleEditChange} fullWidth multiline rows={2} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading} sx={{ backgroundColor: '#d72660', color: 'white', '&:hover': { backgroundColor: '#b71c4a' } }}>
            {editLoading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deleteProduct} onClose={closeDelete}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          Are you sure you want to delete product {deleteProduct?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>{deleteLoading ? <CircularProgress size={20} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts; 