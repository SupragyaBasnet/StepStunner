import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileOverview: React.FC = () => {
  const { user, setUser } = useAuth() as any;
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+977/, '') : '');
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const nameRef = useRef<HTMLInputElement>(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const userData = localStorage.getItem('stepstunnerUser');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (editMode) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [editMode]);

  const handleEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone ? user.phone.replace(/^\+977/, '') : '');
    setEditMode(true);
  };
  const handleCancelEdit = () => setEditMode(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbar({ open: false, message: '', severity: 'success' });
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
        body: JSON.stringify({ name, email, phone: '+977' + phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      setUser && setUser((prev: any) => ({ ...prev, name: data.name, email: data.email, phone: data.phone }));
      // Update localStorage for login consistency
              const userData = JSON.parse(localStorage.getItem('stepstunnerUser') || '{}');
        localStorage.setItem('stepstunnerUser', JSON.stringify({ ...userData, name: data.name, email: data.email, phone: data.phone }));
      // If a new token is returned (e.g., after email change), update it
      if (data.token) {
                  localStorage.setItem('stepstunnerToken', data.token);
      }
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
      setEditMode(false);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update profile', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ borderRadius: 5, p: 4, minWidth: 350, maxWidth: 520, minHeight: 560, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mx: 'auto', width: '100%' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile Overview</Typography>
      <Box component="form" onSubmit={handleProfileSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={!editMode}
          inputRef={nameRef}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={!editMode}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          disabled={!editMode}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: 'text.secondary' }}>+977</Box>
            ),
          }}
        />
        {!editMode ? (
                    
          <Button
            variant="outlined"
            sx={{
              display: 'flex', justifyContent: 'center', mt: 3,
              color: 'rgb(255,106,106)',
              borderColor: 'rgb(255,106,106)',
              
              borderRadius: 50,
              px: 4,
              fontWeight: 700,
              width:200,
              textTransform: 'uppercase',
              mx: 'auto',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgb(255,106,106)',
                borderColor: 'rgb(255,106,106)',
              },
            }}
            onClick={handleEdit}
            fullWidth
          >
            EDIT
          </Button>
         
        ) : (
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: 'rgb(255,106,106)',
                color: 'white',
                borderRadius: 50,
                px: 4,
                fontWeight: 700,
                textTransform: 'uppercase',
                '&:hover': { backgroundColor: 'rgb(220,80,80)' },
              }}
              fullWidth
            >
              Save Changes
            </Button>
            <Button
              variant="text"
              color="secondary"
              onClick={handleCancelEdit}
              sx={{
                borderRadius: 50,
                px: 4,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileOverview; 