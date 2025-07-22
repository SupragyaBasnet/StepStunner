import React from 'react';
import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';

const stats = [
  { label: 'Total Users', value: 123 },
  { label: 'Total Products', value: 45 },
  { label: 'Total Orders', value: 67 },
  { label: 'Recent Logs', value: 10 },
];

const recentActivity = [
  { action: 'User registered', time: '2024-07-21 10:00' },
  { action: 'Order placed', time: '2024-07-21 09:45' },
  { action: 'Product added', time: '2024-07-21 09:30' },
  { action: 'User promoted to admin', time: '2024-07-21 09:15' },
];

const AdminDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3} mb={4}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={600}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Activity
        </Typography>
        <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
          <List>
            {recentActivity.map((item, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <ListItemText
                    primary={item.action}
                    secondary={item.time}
                  />
                </ListItem>
                {idx < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 