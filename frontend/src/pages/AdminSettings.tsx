import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PhotoCamera,
  PhotoLibrary,
  Delete,
  Edit,
  Security,
  Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      setSnackbar({ open: true, message: 'Password changed successfully! Please log in with your new password.', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Clear authentication state and redirect to login
      logout();
      navigate('/login');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to change password.', severity: 'error' });
    }
  };

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
          console.log('Profile image update response:', data);
          if (res.ok) {
            // Update user state
            setUser && setUser((prev: any) => ({ ...prev, profileImage: data.profileImage }));
            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('stepstunnerUser') || '{}');
            localStorage.setItem('stepstunnerUser', JSON.stringify({ ...userData, profileImage: data.profileImage }));
            console.log('Updated user state with profile image:', data.profileImage);
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
              // Update user state
              setUser && setUser((prev: any) => ({ ...prev, profileImage: data.profileImage }));
              // Update localStorage
              const userData = JSON.parse(localStorage.getItem('stepstunnerUser') || '{}');
              localStorage.setItem('stepstunnerUser', JSON.stringify({ ...userData, profileImage: data.profileImage }));
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
        // Update user state
        setUser && setUser((prev: any) => ({ ...prev, profileImage: null }));
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('stepstunnerUser') || '{}');
        localStorage.setItem('stepstunnerUser', JSON.stringify({ ...userData, profileImage: null }));
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d72660', mb: 4 }}>
        Admin Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Image Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 3, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#d72660' }} />
              Profile Image
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: '3rem',
                  border: '3px solid #d72660',
                  boxShadow: '0 4px 20px rgba(215, 38, 96, 0.3)'
                }}
                src={user?.profileImage || undefined}
              >
                {!user?.profileImage && user?.name?.charAt(0)}
              </Avatar>
              
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={handleMenuOpen}
                sx={{ 
                  borderRadius: 7, 
                  fontWeight: 700,
                  borderColor: '#d72660',
                  color: '#d72660',
                  '&:hover': {
                    backgroundColor: 'rgba(215, 38, 96, 0.1)',
                    borderColor: '#d72660'
                  }
                }}
              >
                Change Photo
              </Button>
              
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
            </Box>
          </Card>
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 3, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ color: '#d72660' }} />
              Change Password
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                inputRef={currentPasswordRef}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!newPasswordError}
                helperText={newPasswordError ? 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.' : ''}
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !!newPasswordError}
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b71c4a 0%, #8e1a3a 100%)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: '#ccc'
                  }
                }}
              >
                Change Password
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Camera Dialog */}
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
    </Box>
  );
};

export default AdminSettings; 