import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Button } from '@mui/material';

const AdminDashboard: React.FC = () => {
  // Placeholder stats
  const stats = [
    { label: 'Total Users', value: 123 },
    { label: 'Total Products', value: 45 },
    { label: 'Total Orders', value: 67 },
    { label: 'Recent Logs', value: 10 },
  ];

  // Placeholder recent activity
  const recentActivity = [
    { id: 1, action: 'User registered', time: '2024-07-21 10:00' },
    { id: 2, action: 'Order placed', time: '2024-07-21 09:45' },
    { id: 3, action: 'Product added', time: '2024-07-21 09:30' },
    { id: 4, action: 'User promoted to admin', time: '2024-07-21 09:15' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" color="primary">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>Recent Activity</Typography>
        <Paper sx={{ p: 2 }}>
          {recentActivity.map((item) => (
            <Box key={item.id} sx={{ mb: 1 }}>
              <Typography variant="body1">{item.action}</Typography>
              <Typography variant="caption" color="text.secondary">{item.time}</Typography>
            </Box>
          ))}
        </Paper>
      </Box>
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" href="/admin/users">Manage Users</Button>
        <Button variant="contained" color="primary" href="/admin/products">Manage Products</Button>
        <Button variant="contained" color="primary" href="/admin/orders">Manage Orders</Button>
        <Button variant="contained" color="primary" href="/admin/logs">View Logs</Button>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 