import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { base64Decode } from 'esewajs';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const data = params.get('data');
    if (data) {
      try {
        const decoded = base64Decode(data);
        setPaymentInfo(decoded);
        setLoading(false);
      } catch (err) {
        setError('Failed to decode payment information.');
        setLoading(false);
      }
    } else {
      setError('No payment data found.');
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Verifying payment...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" color="error.main" gutterBottom>
          Payment Error
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>{error}</Typography>
        <Button variant="contained" color="primary" component={RouterLink} to="/" size="large">
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" color="success.main" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thank you for your payment. Your order has been placed successfully.
        </Typography>
      </Box>
      {paymentInfo && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid #eee', borderRadius: 2, background: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Transaction Details:</Typography>
          {Object.entries(paymentInfo).map(([key, value]) => (
            <Typography key={key} variant="body2">
              <strong>{key}:</strong> {String(value)}
            </Typography>
          ))}
        </Box>
      )}
      <Button variant="contained" color="primary" component={RouterLink} to="/" size="large">
        Go to Home
      </Button>
    </Container>
  );
};

export default PaymentSuccess; 