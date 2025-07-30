import React, { useEffect, useState } from 'react';
import {
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination, 
  TextField, 
  Box, 
  Button, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface Log {
  _id: string;
  timestamp: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  status: string;
  details: {
    url?: string;
    method?: string;
    userAgent?: string;
    referer?: string;
    responseStatus?: number;
    requestBody?: boolean;
    userEmail?: string;
    userName?: string;
  };
  ipAddress: string;
  method?: string;
  url?: string;
  userAgent?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [creatingSamples, setCreatingSamples] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        console.error('Admin access required');
        return;
      }
      
      const token = localStorage.getItem('stepstunnerToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const userFilter = selectedUser !== 'all' ? `&user=${selectedUser}` : '';
      const url = `/api/admin/logs?search=${encodeURIComponent(search)}&page=${page + 1}&limit=${rowsPerPage}${userFilter}`;
      console.log('🔍 Fetching logs from:', url);
      console.log('👤 Selected user:', selectedUser);
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch logs:', res.statusText);
        return;
      }
      
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('stepstunnerToken');
      const res = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    // eslint-disable-next-line
  }, [page, rowsPerPage, selectedUser]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleUserFilterChange = (e: SelectChangeEvent<string>) => {
    setSelectedUser(e.target.value);
    setPage(0);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line
  }, [search]);

  const createSampleLogs = async () => {
    try {
      setCreatingSamples(true);
      const token = localStorage.getItem('stepstunnerToken');
      const res = await fetch('/api/admin/logs/sample', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setMessage('Sample logs created successfully!');
        fetchLogs(); // Refresh the logs
      } else {
        setMessage('Failed to create sample logs');
      }
    } catch (error) {
      setMessage('Error creating sample logs');
    } finally {
      setCreatingSamples(false);
    }
  };

  const getActionInfo = (log: Log) => {
    const action = log.action.toLowerCase();
    const url = log.details?.url || log.url || '';
    const method = log.method || log.details?.method || '';
    
    // Get user name from multiple sources
    const getUserName = () => {
      if (log.userId?.name) return log.userId.name;
      if (log.details?.userName) return log.details.userName;
      if (log.details?.userEmail) return log.details.userEmail.split('@')[0];
      return 'Unknown';
    };
    
    const userName = getUserName();
    
    if (action.includes('login')) {
      return `User (${userName}) logged in via ${method} request`;
    } else if (action.includes('register')) {
      return `User (${userName}) registered new account`;
    } else if (action.includes('logout')) {
      return `User (${userName}) logged out`;
    } else if (action.includes('password')) {
      return `User (${userName}) changed password`;
    } else if (action.includes('profile')) {
      return `User (${userName}) updated profile information`;
    } else if (action.includes('order')) {
      return `User (${userName}) ${action.includes('create') ? 'placed new order' : 'viewed orders'}`;
    } else if (action.includes('payment')) {
      return `User (${userName}) processed payment`;
    } else if (action.includes('product')) {
      return `User (${userName}) ${action.includes('view') ? 'viewed products' : 'managed products'}`;
    } else if (action.includes('user_management')) {
      return `Admin (${userName}) accessed user management`;
    } else if (action.includes('log_view')) {
      return `Admin (${userName}) viewed activity logs`;
    } else if (action.includes('admin')) {
      return `Admin (${userName}) performed administrative action`;
    } else if (url) {
      return `User (${userName}) accessed ${url} via ${method}`;
    } else {
      return `User (${userName}) performed ${action} action`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Activity Logs</Typography>
      
      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>FILTER BY USER:</InputLabel>
          <Select
            value={selectedUser}
            label="FILTER BY USER:"
            onChange={handleUserFilterChange}
            size="small"
          >
            <MenuItem value="all">All Users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          label="Search logs"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <Button 
          variant="outlined" 
          onClick={createSampleLogs} 
          disabled={creatingSamples}
          size="small"
        >
          {creatingSamples ? 'Creating...' : 'Create Sample Logs'}
        </Button>
      </Box>
      
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      
      <Paper sx={{ backgroundColor: '#f5f5f5' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: '#e0e0e0',
                height: '28px',
                '& th': { 
                  padding: '4px 8px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }
              }}>
                <TableCell>TIME</TableCell>
                <TableCell>USER</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>ACTION</TableCell>
                <TableCell>METHOD</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>INFO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} sx={{ 
                  '&:hover': { backgroundColor: '#f0f0f0' },
                  height: '24px',
                  '& td': { 
                    padding: '4px 8px',
                    fontSize: '0.875rem',
                    lineHeight: '1'
                  }
                }}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {log.userId && log.userId.name && log.userId.email 
                      ? `${log.userId.name} (${log.userId.email})`
                      : log.details?.userEmail 
                        ? `${log.details.userName || 'User'} (${log.details.userEmail})`
                        : 'Guest User (guest@stepstunner.com)'
                    }
                  </TableCell>
                  <TableCell>
                    {log.ipAddress || '127.0.0.1'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      size="small" 
                      color={getStatusColor(log.status) as any}
                      variant="outlined"
                      sx={{ 
                        height: '20px',
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                          padding: '0 6px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {log.method || log.details?.method || 'GET'}
                  </TableCell>
                  <TableCell>
                    {log.details?.url || log.url || '/'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 300, wordBreak: 'break-word', fontSize: '0.75rem' }}>
                      {getActionInfo(log)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No logs found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Loading logs...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default AdminLogs; 