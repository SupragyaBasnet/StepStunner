import {
  Close, Delete, Home,
  LocalShipping,
  LocationOn, PhotoCamera,
  PhotoLibrary, Settings as SettingsIcon, Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert, Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List,
  ListItem,
  ListItemText, Menu,
  MenuItem, Paper, Rating, Snackbar, Stack, Tab, Tabs, TextField, Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock data for addresses
const mockAddresses = [
  { id: 1, label: 'Home', address: '123 Main St, Kathmandu, Nepal' },
  { id: 2, label: 'Office', address: '456 Business Rd, Lalitpur, Nepal' },
];

// Simple client-side price map (placeholder) - Needed for calculating and displaying item price
const productPrices: Record<string, number> = {
  tshirt: 500,
  mug: 300,
  phonecase: 800,
  waterbottle: 600,
  cap: 400,
  notebook: 700,
  pen: 200,
  keychain: 200,
  frame: 3000,
  pillowcase: 900,
};

const Profile: React.FC = () => {
  const { user, logout, setUser } = useAuth() as any;
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<string[]>([]); // Initialize as an empty array of strings
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const userData = localStorage.getItem('stepstunnerUser');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Add state for order history
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  // Local state for form fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+977/, '') : '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

  // State for password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Add edit mode state
  const [editMode, setEditMode] = useState(false);

  // Password strength validation
  const isStrongPassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };
  const newPasswordError = newPassword && !isStrongPassword(newPassword);

  // Only set local state in handleEdit
  const handleEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone ? user.phone.replace(/^\+977/, '') : '');
    setEditMode(true);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
  };

  // Tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  // Address handlers
  // Update the handleDeleteAddress to remove from the state array and save to localStorage
  const handleDeleteAddress = (addressToDelete: string) => {
    const updatedAddresses = addresses.filter(addr => addr !== addressToDelete);
    setAddresses(updatedAddresses);
    localStorage.setItem('stepstunnerAddresses', JSON.stringify(updatedAddresses));
    setSnackbar({open: true, message: 'Address removed from list', severity: 'success'});
  };

  // Add address handler
  const handleAddAddress = (newAddress: string) => {
    if (!newAddress.trim()) return;
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    localStorage.setItem('stepstunnerAddresses', JSON.stringify(updatedAddresses));
    setSnackbar({open: true, message: 'Address added!', severity: 'success'});
  };

  // Profile update handler (mock)
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
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
      setUser && setUser((prev: any) => ({ ...prev, name: data.name, email: data.email, phone: data.phone }));
      setEditMode(false);
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Failed to update profile', severity: 'error' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
        console.error('Error accessing camera:', err);
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
        // Upload to backend just like gallery upload
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

  // Toggle expanded order details
  const handleToggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Review modal handlers
  const handleOpenReviewModal = (orderId: string) => {
    const order = orderHistory.find((o: any) => o._id === orderId);
    setReviewOrderId(orderId);
    setReviewText(order?.review || '');
    setReviewRating(order?.rating || null);
    setOpenReviewModal(true);
  };
  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
    setReviewText('');
    setReviewRating(null);
    setReviewOrderId(null);
  };

  // --- Tab Panels ---
  function TabPanel({ children, value, index }: { children: React.ReactNode, value: number, index: number }) {
    return (
      <div hidden={value !== index} style={{ width: '100%' }}>
        {value === index && children}
      </div>
    );
  }

  // Load order history and addresses from backend on mount
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // Try to get userId from localStorage
        const userData = JSON.parse(localStorage.getItem('stepstunnerUser') || '{}');
        const userId = userData?._id || user?.id || user?.userId;
        if (userId) {
          const res = await fetch(`/api/products/orders?userId=${userId}`);
          if (!res.ok) throw new Error('Failed to fetch order history');
          const orders = await res.json();
          setOrderHistory(orders);
          // Extract unique addresses from orders
          const uniqueAddresses = Array.from(
            new Set(
              orders
                .map((order: any) => order.address)
                .filter((address: string) => !!address)
            )
          );
            setAddresses(uniqueAddresses as string[]);
        } else {
          setOrderHistory([]);
          setAddresses([]);
        }
      } catch (e) {
        setOrderHistory([]);
        setAddresses([]);
      }
    };
    fetchOrderHistory();
  }, [user]);
  
  // Update handleSubmitReview to call backend and update UI
  const handleSubmitReview = async () => {
    if (!reviewOrderId || !reviewText.trim() || !reviewRating) return;
    try {
      const res = await fetch(`/api/products/orders/${reviewOrderId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
        body: JSON.stringify({ review: reviewText, rating: reviewRating }),
      });
      const updatedOrder = await res.json();
      if (!res.ok) throw new Error(updatedOrder.message || 'Failed to submit review');
      setOrderHistory((prev) => prev.map((order: any) => order._id === updatedOrder._id ? updatedOrder : order));
      setSnackbar({ open: true, message: 'Review submitted!', severity: 'success' });
      // Trigger product refresh for product cards
      localStorage.setItem('stepstunnerProductsRefresh', 'true');
      handleCloseReviewModal();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to submit review', severity: 'error' });
    }
  };

  // Change password handler
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
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setSnackbar({ open: true, message: 'Password changed successfully! Please log in again.', severity: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to change password', severity: 'error' });
    }
  };

  // Fetch profile image from backend on mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
                  headers: {
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
        });
        const data = await res.json();
        if (res.ok && data.profileImage) {
          setUser && setUser((prev: any) => ({ ...prev, profileImage: data.profileImage }));
        } else {
          setUser && setUser((prev: any) => ({ ...prev, profileImage: null }));
        }
      } catch (err) {
        setUser && setUser((prev: any) => ({ ...prev, profileImage: null }));
      }
    };
    fetchProfileImage();
  }, [setUser]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Focus the name input when entering edit mode
  useEffect(() => {
    console.log("component reloaded.");
    if (nameInputRef.current) {
      console.log("changed name");
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    console.log("Profile mounted");
    return () => console.log("Profile unmounted");
  }, []);

  useEffect(() => {
    console.log("user changed", user);
  }, [user]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="flex-start">
          {/* Sidebar/Profile summary */}
          <Box sx={{ minWidth: 200, textAlign: 'center', mb: { xs: 2, sm: 0 }, position: 'relative' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                sx={{ width: 100, height: 100, fontSize: '2.5rem', mx: 'auto', mb: 2 }}
                src={user?.profileImage || undefined}
              >
                {!user?.profileImage && user?.name.charAt(0)}
              </Avatar>
              <IconButton
                aria-label="upload profile photo"
                onClick={handleMenuOpen}
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  backgroundColor: 'white',
                  color: 'black',
                  boxShadow: 2,
                  '&:hover': { backgroundColor: '#f0f0f0' },
                  width: 32,
                  height: 32,
                  zIndex: 1,
                  p: 0,
                }}
                size="small"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
            <Tabs
              orientation={window.innerWidth < 600 ? 'horizontal' : 'vertical'}
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              sx={{
                borderRight: { sm: 1, md: 1, xs: 0, borderColor: 'divider' },
                minWidth: 180,
                mt: 2,
                mb: { xs: 2, sm: 0 },
                '& .MuiTab-root': {
                  color: '#888', // grey for all tab text
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: '#111 !important', // black for selected tab text
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#111', // black indicator
                },
              }}
            >
              <Tab icon={<Home />} iconPosition="start" label="Profile" />
              <Tab icon={<LocalShipping />} iconPosition="start" label="Orders" />
              <Tab icon={<LocationOn />} iconPosition="start" label="Addresses" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
              <Tab icon={<Delete />} iconPosition="start" label="Delete Account" />
              
            </Tabs>
          </Box>
          {/* Main content */}
          <Box sx={{ flex: 1 }}>
            {/* Profile Tab */}
            <TabPanel value={tab} index={0}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Profile Overview</Typography>
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  // type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  disabled={!editMode}
                  inputRef={nameInputRef}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  // type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={!editMode}
                  inputRef={emailInputRef}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  // type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary' }}>+977</Box>
                    ),
                  }}
                  autoComplete="phone"
                  disabled={!editMode}
                  inputRef={phoneInputRef}
                />
                {!editMode ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 3, mb: 2,borderRadius: 7, color: 'rgb(255,106,106)', borderColor: 'rgb(255,106,106)', width: 'auto', alignSelf: 'flex-start', '&:hover': { color: 'rgb(255,106,106)', borderColor: 'rgb(255,106,106)', backgroundColor: 'rgba(255,106,106,0.08)' } }}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
                <Button 
                  type="submit" 
                  size="small"
                  variant="outlined"
                      sx={{ borderRadius: 7,color: 'rgb(255,106,106)', borderColor: 'rgb(255,106,106)', width: 'auto', alignSelf: 'flex-start', '&:hover': { color: 'rgb(255,106,106)', borderColor: 'rgb(255,106,106)', backgroundColor: 'rgba(255,106,106,0.08)' } }}
                >
                  Save Changes
                </Button>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ borderRadius: 7,color: '#888', alignSelf: 'flex-start' }}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>
            {/* Orders Tab */}
            <TabPanel value={tab} index={1}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Order History</Typography>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: '#fafbfc', boxShadow: 'none', mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                  {orderHistory.length === 0 ? (
                    <Typography variant="body1" align="center">No orders found.</Typography>
                  ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px' }}>Order #</th>
                        <th style={{ padding: '8px' }}>Date</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Address</th>
                        <th style={{ padding: '8px' }}>Payment</th>
                        <th style={{ padding: '8px' }}>Total</th>
                        <th style={{ padding: '8px' }}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order: any) => (
                        <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px' }}>{order._id.slice(-6).toUpperCase()}</td>
                          <td style={{ padding: '8px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '8px' }}>{order.status || 'Confirmed'}</td>
                          <td style={{ padding: '8px' }}>{order.address}</td>
                          <td style={{ padding: '8px' }}>{order.paymentMethod}</td>
                          <td style={{ padding: '8px' }}>Rs {order.total?.toFixed(2)}</td>
                          <td style={{ padding: '8px' }}>
                            {order.review && order.rating ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Rating value={order.rating} readOnly size="small" />
                                <Typography variant="body2" sx={{ mt: 0.5 }}>{order.review}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {order.createdAt ? `Reviewed on ${new Date(order.createdAt).toLocaleDateString()}` : ''}
                                </Typography>
                                <Button size="small" variant="text" sx={{ mt: 0.5 }} onClick={() => handleOpenReviewModal(order._id)}>
                                  Edit Review
                                </Button>
                              </Box>
                            ) : (
                              <Button size="small" variant="outlined" onClick={() => handleOpenReviewModal(order._id)}>
                                Leave Review
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Paper>
            </TabPanel>
            {/* Addresses Tab */}
            <TabPanel value={tab} index={2}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Address Book</Typography>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: '#fafbfc', boxShadow: 'none', mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                <List>
                  {addresses.length === 0 ? (
                    <Typography variant="body1" align="center">No saved addresses found from orders.</Typography>
                  ) : (
                    addresses.map((address, index) => (
                      <ListItem key={index} secondaryAction={
                        <IconButton edge="end" aria-label="delete address" onClick={() => handleDeleteAddress(address)}>
                          <Delete />
                        </IconButton>
                      }>
                        <ListItemText primary={`Address ${index + 1}`} secondary={address} />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </TabPanel>
            {/* Settings Tab */}
            <TabPanel value={tab} index={3}>
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
                <Button
                  variant="outlined"
                  sx={{
                   
                    mt: 2,
                    borderRadius: 7,
                    fontWeight: 700,
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
            </TabPanel>
          </Box>
        </Stack>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Photo Upload Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
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

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onClose={handleCameraClose} maxWidth="sm" fullWidth>
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCameraClose} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            onClick={handleCapturePhoto}
            variant="contained"
            color="primary"
            startIcon={<PhotoCamera />}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={openReviewModal} onClose={handleCloseReviewModal} maxWidth="sm" fullWidth>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle1">Your Rating:</Typography>
            <Rating
              name="review-rating"
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue)}
              size="large"
            />
            <TextField
              label="Your Review"
              multiline
              minRows={3}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewModal}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained" disabled={!reviewRating || !reviewText.trim()}>
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

   
    </Container>
  );
};

export default Profile; 
