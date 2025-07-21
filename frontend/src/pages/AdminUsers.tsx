import React, { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, IconButton, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, CircularProgress, DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page + 1}&limit=${rowsPerPage}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line
  }, [search]);

  // Edit user handlers
  const openEdit = (user: User) => setEditUser(user);
  const closeEdit = () => setEditUser(null);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (!editUser) return;
    const { name, value, type } = e.target as HTMLInputElement;
    setEditUser({
      ...editUser,
      [name!]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };
  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    await fetch(`/api/admin/users/${editUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editUser),
    });
    setEditLoading(false);
    closeEdit();
    fetchUsers();
  };

  // Delete user handlers
  const openDelete = (user: User) => setDeleteUser(user);
  const closeDelete = () => setDeleteUser(null);
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    closeDelete();
    fetchUsers();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search users"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary" disabled>
          Add User
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>MFA</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>{user.mfaEnabled ? 'Enabled' : 'Disabled'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => openDelete(user)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No users found.</TableCell>
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

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Name" name="name" value={editUser.name} onChange={handleEditChange} fullWidth />
              <TextField label="Email" name="email" value={editUser.email} onChange={handleEditChange} fullWidth />
              <TextField label="Phone" name="phone" value={editUser.phone} onChange={handleEditChange} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select name="role" value={editUser.role} label="Role" onChange={handleEditChange}>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={editUser.isActive} onChange={handleEditChange} name="isActive" />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch checked={editUser.mfaEnabled} onChange={handleEditChange} name="mfaEnabled" />}
                label="MFA Enabled"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading}>{editLoading ? <CircularProgress size={20} /> : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={!!deleteUser} onClose={closeDelete}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user {deleteUser?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>{deleteLoading ? <CircularProgress size={20} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 