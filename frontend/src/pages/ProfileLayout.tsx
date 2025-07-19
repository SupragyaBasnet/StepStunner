import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Box, Avatar, Typography, List, ListItem, ListItemIcon, ListItemText, Paper, IconButton, Menu, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Home, LocalShipping, LocationOn, Settings as SettingsIcon, PhotoCamera, PhotoLibrary } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import React, { useRef, useState } from 'react';

const navItems = [
  { label: 'Profile', path: 'info', icon: <Home /> },
  { label: 'Orders', path: 'orders', icon: <LocalShipping /> },
  { label: 'Addresses', path: 'addresses', icon: <LocationOn /> },
  { label: 'Settings', path: 'settings', icon: <SettingsIcon /> },
];

const themeColor = 'rgb(255,106,106)';
const themeColorLight = 'rgba(255,106,106,0.13)';
const themeColorHover = 'rgba(255,106,106,0.07)';

export default function ProfileLayout() {
  const location = useLocation();
  const { user, setUser } = useAuth() as any;
  const activeIndex = navItems.findIndex(item => location.pathname.includes('/' + item.path));

  // Camera/upload logic
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false); // Prevent double delete

  // Debug: log dialog state
  React.useEffect(() => {
    console.log('Delete dialog open:', showDeleteConfirm);
  }, [showDeleteConfirm]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
    handleMenuClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
          const res = await fetch('/api/auth/profile-image', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
            },
            body: JSON.stringify({ profileImage: base64Image }),
          });
          const data = await res.json();
          if (res.ok) {
            setUser && setUser((prev: any) => ({ ...prev, profileImage: data.profileImage }));
            setSnackbar({ open: true, message: 'Profile image updated!', severity: 'success' });
          } else {
            setSnackbar({ open: true, message: data.message || 'Failed to update profile image', severity: 'error' });
          }
        } catch (err) {
          setSnackbar({ open: true, message: 'Failed to update profile image', severity: 'error' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraOpen = () => {
    setShowCameraDialog(true);
    handleMenuClose();
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Error accessing camera', severity: 'error' });
      });
  };

  const handleCameraClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraDialog(false);
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg');
        (async () => {
          try {
            const res = await fetch('/api/auth/profile-image', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
              },
              body: JSON.stringify({ profileImage: base64Image }),
            });
            const data = await res.json();
            if (res.ok) {
              setUser && setUser((prev: any) => ({ ...prev, profileImage: data.profileImage }));
              setSnackbar({ open: true, message: 'Profile image updated!', severity: 'success' });
            } else {
              setSnackbar({ open: true, message: data.message || 'Failed to update profile image', severity: 'error' });
            }
          } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update profile image', severity: 'error' });
          }
        })();
        handleCameraClose();
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return; // Prevent double execution
    setDeleting(true);
    try {
      const token = localStorage.getItem('stepstunnerToken');
  
      if (!token) {
        setSnackbar({
          open: true,
          message: 'You are not logged in.',
          severity: 'error',
        });
        setDeleting(false);
        return;
      }
  
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // ✅ Success: Remove token, clear user, redirect
        localStorage.removeItem('stepstunnerToken');
        setUser(null);
        // Store flag in sessionStorage to show success message after redirect
        sessionStorage.setItem('accountDeleted', '1');
        setSnackbar({
          open: true,
          message: data.message || 'Account deleted successfully. Redirecting...',
          severity: 'success',
        });
  
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      } else {
        console.error('Delete account failed:', data);
        setSnackbar({
          open: true,
          message: data.message || 'Failed to delete account.',
          severity: 'error',
        });
        setDeleting(false);
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setSnackbar({
        open: true,
        message: 'Server error while deleting account.',
        severity: 'error',
      });
      setDeleting(false);
    }
  
    setShowDeleteConfirm(false);
  };
  
  // Show account deleted message if redirected to register page
  React.useEffect(() => {
    if (window.location.pathname === '/register' && sessionStorage.getItem('accountDeleted')) {
      setSnackbar({
        open: true,
        message: 'Account deleted successfully.',
        severity: 'success',
      });
      sessionStorage.removeItem('accountDeleted');
    }
  }, []);
  
  

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'flex' },
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center',
        alignItems: { xs: 'stretch', md: 'flex-start' },
        minHeight: '70vh',
        background: 'transparent',
        py: { xs: 2, md: 6 },
        px: { xs: 1, md: 0 },
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: { xs: '100%', md: 290 },
          minHeight: 420,
          borderRadius: 5,
          p: { xs: 2, md: 3 },
          mb: { xs: 3, md: 0 },
          mr: { xs: 0, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f8fafc 80%, #f3f6fb 100%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <Avatar
            sx={{
              width: 96,
              height: 96,
              fontSize: 44,
              boxShadow: 2,
              mx: 'auto',
            }}
            src={user?.profileImage || undefined}
          >
            {!user?.profileImage && user?.name?.charAt(0)}
          </Avatar>
          <IconButton
            aria-label="upload profile photo"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 5,
              backgroundColor: 'white',
              color: 'black',
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f0f0f0', color: 'rgb(255,106,106)' },
              width: 36,
              height: 36,
              zIndex: 1,
              p: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            size="small"
          >
            <PhotoCamera fontSize="medium" />
          </IconButton>
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ mb: 0.5, letterSpacing: 0.2, textAlign: 'center', fontSize: { xs: '1.1rem', md: '1.25rem' } }}
        >
          {user?.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 500, letterSpacing: 0.1, textAlign: 'center', fontSize: { xs: '0.95rem', md: '1rem' } }}
        >
          {user?.email}
        </Typography>
        <List sx={{ width: '100%', mt: 1 }}>
          {navItems.map((item, idx) => (
            <ListItem
              button
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={activeIndex === idx}
              sx={{
                borderRadius: 3,
                mb: 1.2,
                px: 2.5,
                py: 1.2,
                color: activeIndex === idx ? themeColor : 'text.secondary',
                backgroundColor: activeIndex === idx ? themeColorLight : 'transparent',
                fontWeight: activeIndex === idx ? 700 : 500,
                position: 'relative',
                transition: 'background 0.18s, color 0.18s',
                '&:hover': {
                  backgroundColor: themeColorHover,
                  color: themeColor,
                },
                '&.Mui-selected': {
                  color: themeColor,
                  backgroundColor: themeColorLight,
                },
                '&:before': activeIndex === idx ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: 2,
                  background: themeColor,
                  transition: 'background 0.18s',
                } : {},
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeIndex === idx ? themeColor : 'text.secondary',
                  minWidth: 36,
                  transition: 'color 0.18s',
                  '&:hover': {
                    color: themeColor,
                  },
                  '.Mui-selected &': {
                    color: themeColor,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{ fontWeight: activeIndex === idx ? 700 : 500 }} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{
            mt: 2,
            borderRadius: 3,
            fontWeight: 700,
            borderColor: themeColor,
            color: themeColor,
            '&:hover': {
              backgroundColor: themeColorLight,
              borderColor: themeColor,
              color: themeColor,
            },
          }}
          onClick={() => {
            setShowDeleteConfirm(true);
            console.log('Delete Account button clicked, dialog should open');
          }}
        >
          Delete Account
        </Button>
        <Dialog open={showDeleteConfirm} onClose={() => {
          setShowDeleteConfirm(false);
          console.log('Dialog closed by clicking outside or cancel');
        }}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button color="error" variant="contained" onClick={() => {
              handleDeleteAccount();
              console.log('Delete confirmed, handleDeleteAccount called');
            }} disabled={deleting}>Delete</Button>
            <Button onClick={() => {
              setShowDeleteConfirm(false);
              console.log('Delete cancelled, dialog closed');
            }}>Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* Upload/Capture Menu and Dialogs */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleGalleryUpload}>
            <PhotoLibrary sx={{ mr: 1 }} /> Upload from Gallery
          </MenuItem>
          <MenuItem onClick={handleCameraOpen}>
            <PhotoCamera sx={{ mr: 1 }} /> Take Photo
          </MenuItem>
        </Menu>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
        <Dialog open={showCameraDialog} onClose={handleCameraClose} maxWidth="xs" fullWidth>
          <DialogTitle>Take Photo</DialogTitle>
          <DialogContent>
            <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: 8 }} />
          </DialogContent>
          <DialogActions>
            <IconButton onClick={handleCameraClose}>Cancel</IconButton>
            <Button onClick={handleCapturePhoto} variant="contained">Capture</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          minWidth: { xs: '100%', md: 350 },
          maxWidth: { xs: '100%', md: 520 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
} 