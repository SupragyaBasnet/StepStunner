import React, { useRef, useState, useEffect } from 'react';
import { Avatar, Box, Button, IconButton, Menu, MenuItem, Paper, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PhotoCamera, PhotoLibrary, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileImage: React.FC = () => {
  const { user, setUser } = useAuth() as any;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const userData = localStorage.getItem('stepstunnerUser');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
  }, [navigate]);

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
      .catch((err) => {
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

  const handleRemovePhoto = async () => {
    try {
      const res = await fetch('/api/auth/profile-image', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
      });
      if (res.ok) {
        setUser && setUser((prev: any) => ({ ...prev, profileImage: null }));
        setSnackbar({ open: true, message: 'Profile image removed!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to remove profile image', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to remove profile image', severity: 'error' });
    }
    handleMenuClose();
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 400, mx: 'auto', mt: 6, textAlign: 'center' }}>
      <Avatar
        sx={{ width: 120, height: 120, fontSize: '3rem', mx: 'auto', mb: 2 }}
        src={user?.profileImage || undefined}
      >
        {!user?.profileImage && user?.name?.charAt(0)}
      </Avatar>
      <Box>
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={handleMenuOpen}
          sx={{ borderRadius: 7, fontWeight: 700, mb: 2 }}
        >
          Change Photo
        </Button>
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleGalleryUpload}>
          <PhotoLibrary sx={{ mr: 1 }} /> Upload from Gallery
        </MenuItem>
        <MenuItem onClick={handleCameraOpen}>
          <PhotoCamera sx={{ mr: 1 }} /> Take Photo
        </MenuItem>
        {user?.profileImage && (
          <MenuItem onClick={handleRemovePhoto} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Remove Photo
          </MenuItem>
        )}
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
          <Button onClick={handleCameraClose}>Cancel</Button>
          <Button onClick={handleCapturePhoto} variant="contained">Capture</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileImage; 