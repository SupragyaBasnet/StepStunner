import { Alert, Box, Button, Paper, Snackbar, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileOverview: React.FC = () => {
  const { user, setUser, logout } = useAuth() as any;
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
      setSnackbar({ open: true, message: 'Profile updated! Please log in again.', severity: 'success' });
      setEditMode(false);
      // Clear authentication state and redirect to login
      logout();
      navigate('/login');
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update profile', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ borderRadius: 5, p: 4, minWidth: 350, maxWidth: 520, minHeight: 625, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mx: 'auto', width: '100%' }}>
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
              color: '#d72660',
              borderColor: '#d72660',
              
              borderRadius: 50,
              px: 4,
              fontWeight: 700,
              width:200,
              textTransform: 'uppercase',
              mx: 'auto',
              '&:hover': {
                color: 'white',
                backgroundColor: '#d72660',
                borderColor: '#d72660',
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
                backgroundColor: '#d72660',
                color: 'white',
                borderRadius: 50,
                px: 4,
                fontWeight: 700,
                textTransform: 'uppercase',
                '&:hover': { backgroundColor: '#b71c4a' },
              }}
              fullWidth
            >
              Save Changes
            </Button>
            <Button
              variant="text"
              onClick={handleCancelEdit}
              sx={{
                color: '#d72660',
                borderRadius: 50,
                px: 4,
                fontWeight: 700,
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: 'rgba(215, 38, 96, 0.1)',
                },
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