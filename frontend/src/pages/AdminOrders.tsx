import React, { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, IconButton, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, CircularProgress, SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';

interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  total: number;
  status: string;
  createdAt: string;
  address: string;
  paymentMethod: string;
  rating?: number;
  review?: string;
  items?: { name: string; qty: number; price: number }[];
}

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewStatus, setViewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async () => {
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
      
      const res = await fetch(`/api/admin/orders?search=${encodeURIComponent(search)}&page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch orders:', res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error('Error details:', errorData);
        return;
      }
      
      const data = await res.json();
      console.log('Orders API response:', data);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line
  }, [search]);

  // View order handlers
  const openView = (order: Order) => {
    setViewOrder(order);
    setViewStatus(order.status);
  };
  const closeView = () => setViewOrder(null);
  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    setViewStatus(e.target.value);
  };
  const handleStatusSave = async () => {
    if (!viewOrder) return;
    setStatusLoading(true);
    const token = localStorage.getItem('stepstunnerToken');
    await fetch(`/api/admin/orders/${viewOrder._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: viewStatus }),
    });
    setStatusLoading(false);
    closeView();
    fetchOrders();
  };

  // Delete order handlers
  const openDelete = (order: Order) => setDeleteOrder(order);
  const closeDelete = () => setDeleteOrder(null);
  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleteLoading(true);
    const token = localStorage.getItem('stepstunnerToken');
    await fetch(`/api/admin/orders/${deleteOrder._id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setDeleteLoading(false);
    closeDelete();
    fetchOrders();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Order Management</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search orders"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary" disabled>
          Add Order
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user?.name || 'Unknown User'}</TableCell>
                  <TableCell>{order.address || 'No address'}</TableCell>
                  <TableCell>Rs {order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openView(order)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => openDelete(order)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No orders found.</TableCell>
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

      {/* View Order Modal */}
      <Dialog open={!!viewOrder} onClose={closeView} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {viewOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography><b>Order ID:</b> {viewOrder._id}</Typography>
              <Typography><b>User:</b> {viewOrder.user?.name || 'Unknown User'}</Typography>
              <Typography><b>Address:</b> {viewOrder.address || 'No address provided'}</Typography>
              <Typography><b>Payment Method:</b> {viewOrder.paymentMethod || 'Not specified'}</Typography>
              <Typography><b>Total:</b> Rs {viewOrder.total.toFixed(2)}</Typography>
              <Typography><b>Status:</b></Typography>
              <Select value={viewStatus} onChange={handleStatusChange} fullWidth>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
              <Typography><b>Created:</b> {new Date(viewOrder.createdAt).toLocaleString()}</Typography>
              {viewOrder.rating && (
                <Typography><b>Rating:</b> {viewOrder.rating}/5 ⭐</Typography>
              )}
              {viewOrder.review && (
                <Box>
                  <Typography><b>Review:</b></Typography>
                  <Typography sx={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: 2, 
                    borderRadius: 1,
                    fontStyle: 'italic'
                  }}>
                    "{viewOrder.review}"
                  </Typography>
                </Box>
              )}
              {viewOrder.items && (
                <Box>
                  <Typography><b>Items:</b></Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>Rs {item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
          <Button onClick={handleStatusSave} variant="contained" disabled={statusLoading}>{statusLoading ? <CircularProgress size={20} /> : 'Save Status'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Order Confirmation */}
      <Dialog open={!!deleteOrder} onClose={closeDelete}>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          Are you sure you want to delete order {deleteOrder?._id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>{deleteLoading ? <CircularProgress size={20} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders; 