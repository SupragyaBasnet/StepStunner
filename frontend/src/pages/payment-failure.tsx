import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PaymentFailure: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h3" color="error.main" gutterBottom>
        Payment Failed
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        Sorry, your payment could not be processed. Please try again or use a different payment method.
      </Typography>
      <Button variant="contained" color="primary" component={RouterLink} to="/cart" size="large">
        Return to Cart
      </Button>
    </Container>
  );
};

export default PaymentFailure; 