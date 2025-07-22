import React, { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Box, Button, Alert
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
  details: any;
  ipAddress: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
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
      
      const res = await fetch(`/api/admin/logs?search=${encodeURIComponent(search)}&page=${page + 1}&limit=${rowsPerPage}`, {
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

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Security Logs</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={createSampleLogs} 
          disabled={creatingSamples}
        >
          {creatingSamples ? 'Creating...' : 'Create Sample Logs'}
        </Button>
        <TextField
          label="Search logs"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
      </Box>
      
      {message && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.userId?.name || 'N/A'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{JSON.stringify(log.details)}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No logs found.</TableCell>
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
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>
    </Box>
  );
};

export default AdminLogs; 