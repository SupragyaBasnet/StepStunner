import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  category: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check if user is admin
        if (!user || user.role !== 'admin') {
          setError('Admin access required');
          return;
        }
        
        const token = localStorage.getItem('stepstunnerToken');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User role:', user.role);
        
        if (!token) {
          setError('No authentication token found');
          return;
        }
        
        const response = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dashboard response:', response.data);
        setData(response.data);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(`Failed to fetch dashboard data: ${err.response.data.message || err.response.statusText}`);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ 
          background: 'linear-gradient(135deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
          borderRadius: 3,
          p: 4
        }}
      >
        <CircularProgress size={60} sx={{ color: '#d72660' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const stats = data ? [
    { label: 'Total Users', value: data.stats.totalUsers },
    { label: 'Total Products', value: data.stats.totalProducts },
    { label: 'Total Orders', value: data.stats.totalOrders },
    { label: 'Total Revenue', value: `Rs ${data.stats.totalRevenue.toFixed(2)}` },
  ] : [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      pb: 6, // Add bottom padding to prevent cutoff
      background: 'linear-gradient(135deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
      borderRadius: 3,
      p: 3
    }}>
      <Typography 
        variant="h4" 
        fontWeight={700} 
        // mt={2}        
        mb={4}
        sx={{ 
          color: '#d72660',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Admin Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              height: '90%',
              width: '30vh',// Ensure equal height
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ 
                p: 3, 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    mb: 2
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#d72660',
                    fontWeight: 700,
                    fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders and Low Stock Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            mb={3}
            sx={{ color: '#d72660' }}
          >
            Recent Orders
          </Typography>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            minHeight: 300
          }}>
            <List sx={{ p: 0 }}>
              {data?.recentOrders.map((order, idx) => (
                <React.Fragment key={order._id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {order.user.name} - Rs {order.total.toFixed(2)}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {order.status} • {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < data.recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <ListItem sx={{ py: 4, px: 3 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" textAlign="center" color="text.secondary">
                        No recent orders
                      </Typography>
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            mb={3}
            sx={{ color: '#d72660' }}
          >
            Low Stock Products
          </Typography>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            minHeight: 300
          }}>
            <List sx={{ p: 0 }}>
              {data?.lowStockProducts.map((product, idx) => (
                <React.Fragment key={product._id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {product.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {product.category} • Stock: {product.stock}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < data.lowStockProducts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
                <ListItem sx={{ py: 4, px: 3 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" textAlign="center" color="text.secondary">
                        No low stock products
                      </Typography>
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;