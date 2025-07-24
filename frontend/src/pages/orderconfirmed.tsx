import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, Card, CardContent, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { base64Decode } from 'esewajs';
import Confetti from 'react-confetti';
import { useCart } from '../context/CartContext';
import { CheckCircle, LocalShipping, Payment } from '@mui/icons-material';

const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const { clearCart, removeFromCart } = useCart();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    // Only perform cart removal/clearing if paymentInfo is present (eSewa)
    if (paymentInfo) {
      const params = new URLSearchParams(location.search);
      const singleItemId = params.get('singleItemId');
      if (singleItemId) {
        const cartItem = JSON.parse(localStorage.getItem('stepstunnerCart') || '[]').find((item: any) => item.cartItemId === singleItemId || item.id === singleItemId);
        if (cartItem) {
          removeFromCart(cartItem.id);
        } else {
          removeFromCart(singleItemId);
        }
      } else {
        clearCart();
      }
    }
  }, [paymentInfo]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#d72660', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#666' }}>
            Verifying your payment...
          </Typography>
        </Container>
      </Box>
    );
  }



  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7f9 0%, #f8f0f3 50%, #f3e9ed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 4, md: 8 },
      px: { xs: 2, md: 4 }
    }}>
      <Confetti 
        width={windowSize.width} 
        height={windowSize.height} 
        numberOfPieces={300} 
        recycle={false}
        colors={['#d72660', '#ff6b9d', '#ffb3d1', '#ffd6e7']}
      />
      
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Success Icon */}
        <Box sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
          animation: 'successPulse 2s ease-in-out infinite'
        }}>
          <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
        </Box>
        
        <Paper elevation={8} sx={{ 
          p: { xs: 3, md: 6 }, 
          borderRadius: 6, 
          width: '100%', 
          maxWidth: 700, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(215, 38, 96, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%)',
            zIndex: 0
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(255, 179, 209, 0.1) 100%)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Order Confirmed!
            </Typography>
            
            <Typography variant="h6" sx={{ 
              mb: 4, 
              fontWeight: 500,
              color: '#666',
              lineHeight: 1.6,
              maxWidth: 500,
              mx: 'auto'
            }}>
              🎉 Thank you for your order! Your payment was successful and your order has been placed successfully.
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                {error}
              </Typography>
            )}

            {/* Order Status Cards */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 2, 
              mb: 4,
              justifyContent: 'center'
            }}>
              <Card sx={{ 
                flex: 1, 
                maxWidth: 200,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8f1 100%)',
                border: '2px solid #4caf50'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#4caf50">
                    Payment Successful
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ 
                flex: 1, 
                maxWidth: 200,
                background: 'linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)',
                border: '2px solid #ff9800'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <LocalShipping sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#ff9800">
                    Order Processing
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {paymentInfo && (
              <Card sx={{ 
                mb: 4, 
                p: 3, 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Payment sx={{ color: '#d72660', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600} color="#d72660">
                    Transaction Details
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: 2,
                  textAlign: 'left'
                }}>
                  {Object.entries(paymentInfo).map(([key, value]) => (
                    <Box key={key} sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                        {String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}



            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              mt: 4,
              justifyContent: 'center'
            }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/" 
                size="large" 
                sx={{ 
                  fontWeight: 700,
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                  boxShadow: '0 4px 16px rgba(215, 38, 96, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #b71c4a 0%, #8e1a3a 100%)',
                    boxShadow: '0 6px 20px rgba(215, 38, 96, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Continue Shopping
              </Button>
              
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/profile/orders" 
                size="large" 
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: '#d72660',
                  color: '#d72660',
                  '&:hover': { 
                    borderColor: '#b71c4a',
                    color: '#b71c4a',
                    bgcolor: 'rgba(215, 38, 96, 0.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                View Orders
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <style>{`
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
};

export default OrderConfirmed; 