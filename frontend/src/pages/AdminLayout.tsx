import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  CssBaseline, 
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280; // Increased drawer width

// Theme colors matching user panel
const themeColor = '#d72660';
const themeColorLight = 'rgba(215, 38, 96, 0.13)';
const themeColorHover = 'rgba(215, 38, 96, 0.08)';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Products', icon: <InventoryIcon />, path: '/admin/products' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/admin/orders' },
  { text: 'Logs', icon: <ListAltIcon />, path: '/admin/logs' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

  const handleLogout = () => {
    logout();
    setSnackbar({open: true, message: 'Logged out successfully', severity: 'success'});
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('stepstunnerToken');
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSnackbar({open: true, message: 'Account deleted successfully', severity: 'success'});
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1000);
      } else {
        setSnackbar({open: true, message: 'Failed to delete account', severity: 'error'});
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({open: true, message: 'Error deleting account', severity: 'error'});
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          background: `linear-gradient(135deg, ${themeColor} 0%, #b71c4a 100%)`,
          boxShadow: '0 4px 20px rgba(215, 38, 96, 0.3)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography 
            variant="h5" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: 'white'
            }}
          >
            Admin Panel
          </Typography>
          
          {/* Admin Info - Simplified Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            {/* User Info Card */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 3,
              px: 3,
              py: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
             
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 45,
                height: 45,
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  mb: 0.5
                }}>
                  {user?.name || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9, 
                  fontSize: '0.8rem',
                  display: 'block',
                  lineHeight: 1.2
                }}>
                  {user?.email || 'admin@example.com'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9, 
                  fontSize: '0.8rem',
                  display: 'block',
                  lineHeight: 1.2
                }}>
                  {user?.phone || '+977-XXXXXXXXX'}
                </Typography>
              </Box>
              <Chip 
                label="ADMIN" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            background: 'linear-gradient(180deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
            borderRight: '1px solid rgba(215, 38, 96, 0.1)',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        <Toolbar />
        <Divider sx={{ borderColor: 'rgba(215, 38, 96, 0.1)' }} />
        
        {/* Navigation Items */}
        <List sx={{ px: 2, py: 2, flexGrow: 1,mt:5 }}>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 3,
                mb: 1.5,
                px: 2.5,
                py: 1.5,
                color: location.pathname === item.path ? themeColor : '#666',
                background: location.pathname === item.path 
                  ? `linear-gradient(135deg, ${themeColor} 0%, #b71c4a 100%)` 
                  : 'transparent',
                boxShadow: location.pathname === item.path 
                  ? '0 4px 15px rgba(215, 38, 96, 0.3)' 
                  : 'none',
                '&:hover': { 
                  background: location.pathname === item.path 
                    ? `linear-gradient(135deg, ${themeColor} 0%, #b71c4a 100%)` 
                    : themeColorHover,
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease'
                },
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:before': location.pathname === item.path ? {
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
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'white' : '#666',
                minWidth: 40,
                transition: 'color 0.2s ease'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 'bold' : 600,
                    color: location.pathname === item.path ? 'white' : 'inherit',
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        {/* Action Buttons at Bottom */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(215, 38, 96, 0.1)' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              color: themeColor,
              borderColor: themeColor,
              mb: 2,
              '&:hover': {
                borderColor: themeColor,
                backgroundColor: themeColorHover,
                transform: 'translateY(-1px)'
              },
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Logout
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ 
              color: '#ff4757',
              borderColor: '#ff4757',
              '&:hover': {
                borderColor: '#ff4757',
                backgroundColor: 'rgba(255, 71, 87, 0.1)',
                transform: 'translateY(-1px)'
              },
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Delete Account
          </Button>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          background: 'linear-gradient(135deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
          p: { xs: 2, md: 4 }, 
          minHeight: '100vh',
          width: `calc(100vw - ${drawerWidth}px)`,
          overflowX: 'auto',
          mt: 8, // Add top margin to account for fixed header
          pt: 2 // Additional top padding
        }}
      >
        <Toolbar />
        <Box sx={{ 
          maxWidth: '100%',
          mx: 'auto',
          px: { xs: 1, md: 2 },
          mt: 2 // Additional margin top for content
        }}>
          {children}
        </Box>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-account-dialog-title"
      >
        <DialogTitle id="delete-account-dialog-title">
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLayout; 