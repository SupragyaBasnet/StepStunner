import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Snackbar, Alert, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  const currentPasswordRef = useRef<HTMLInputElement>(null);

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
    setTimeout(() => {
      currentPasswordRef.current?.focus();
    }, 0);
  }, []);

  const isStrongPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };
  const newPasswordError = newPassword && !isStrongPassword(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbar({ open: true, message: 'Please fill all fields.', severity: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }
    try {
              const token = localStorage.getItem('stepstunnerToken');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({ open: true, message: data.message || 'Failed to change password.', severity: 'error' });
        return;
      }
      // If a new token is returned, update localStorage
      if (data.token) {
                  localStorage.setItem('stepstunnerToken', data.token);
      }
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Optionally, you may want to refresh user context or force re-login
      setTimeout(() => { navigate('/login'); }, 1500);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to change password.', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ borderRadius: 5, p: 4, minWidth: 350, maxWidth: 515, minHeight: 560, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mx: 'auto', width: '100%' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Account Settings</Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
          Change Password
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          name="currentPassword"
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          inputRef={currentPasswordRef}
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowCurrentPassword((show) => !show)}
                edge="end"
                size="small"
              >
                {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
        />
        <TextField
          margin="normal"
          fullWidth
          name="newPassword"
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowNewPassword((show) => !show)}
                edge="end"
                size="small"
              >
                {showNewPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
          error={!!newPasswordError}
          helperText={newPasswordError ? 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.' : ''}
        />
        <TextField
          margin="normal"
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword((show) => !show)}
                edge="end"
                size="small"
              >
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          sx={{
            mt: 2,
            display: 'flex', justifyContent: 'center',
            borderRadius: 50,
            px: 4,
            fontWeight: 700,
            height:40,
            textTransform: 'uppercase',
            color: 'rgb(255,106,106)',
            borderColor: 'rgb(255,106,106)',
            '&:hover': {
              backgroundColor: 'rgba(255,106,106,0.08)',
              borderColor: 'rgb(255,106,106)',
              color: 'rgb(255,106,106)',
            }
          }}
          onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !!newPasswordError}
        >
          Change Password
        </Button>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileSettings; 