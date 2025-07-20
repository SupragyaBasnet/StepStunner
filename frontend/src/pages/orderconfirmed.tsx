import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, Card, CardContent, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { base64Decode } from 'esewajs';
import Confetti from 'react-confetti';
import { useCart } from '../context/CartContext';
import { CheckCircle, LocalShipping, Payment, Favorite } from '@mui/icons-material';

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

  // Mapping of product types to 'why special' messages
  const whySpecialMessages: Record<string, string> = {
    mug: 'A mug is a daily reminder of your care—perfect for every coffee or tea break!',
    tshirt: 'A custom t-shirt lets them wear your love and creativity everywhere.',
    phonecase: 'A personalized phone case keeps memories close and phones protected.',
    waterbottle: 'A unique water bottle keeps them hydrated and thinking of you.',
    cap: 'A custom cap tops off any look with a personal touch.',
    notebook: 'A personalized notebook inspires creativity and captures special thoughts.',
    pen: 'A custom pen makes every word more meaningful.',
    keychain: 'A keychain is a small gift with big memories—always by their side.',
    frame: 'A photo frame preserves moments that matter most.',
    pillowcase: 'A cozy pillowcase brings comfort and sweet dreams.',
    default: 'A personalized gift is a one-of-a-kind treasure, made just for them!'
  };

  function getWhySpecialMessage(item: any) {
    if (item.customizationId || item.customization) {
      return 'This is a one-of-a-kind gift, designed just for you!';
    }
    // Try to infer type from name or category
    const type = (item.productType || item.category || item.name || '').toLowerCase();
    for (const key in whySpecialMessages) {
      if (type.includes(key)) return whySpecialMessages[key];
    }
    return whySpecialMessages.default;
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

            {/* Why This Gift is Special Section */}
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fff5f7 0%, #ffeef2 100%)',
              border: '2px solid #ffb3d1',
              borderRadius: 4,
              p: 4,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Floating hearts */}
              <Box sx={{ position: 'absolute', top: 10, left: 10, animation: 'float 3s ease-in-out infinite' }}>
                <Favorite sx={{ fontSize: 24, color: '#ff6b9d', opacity: 0.6 }} />
              </Box>
              <Box sx={{ position: 'absolute', top: 20, right: 15, animation: 'float 3s ease-in-out infinite 1s' }}>
                <Favorite sx={{ fontSize: 20, color: '#ff6b9d', opacity: 0.4 }} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 15, left: 20, animation: 'float 3s ease-in-out infinite 2s' }}>
                <Favorite sx={{ fontSize: 18, color: '#ff6b9d', opacity: 0.5 }} />
              </Box>

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#d72660',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}>
                  <Favorite sx={{ fontSize: 32, color: '#d72660' }} />
                  Why This Gift is Special
                  <Favorite sx={{ fontSize: 32, color: '#d72660' }} />
                </Typography>

                {/* Order Items */}
                {(() => {
                  let orderItems: any[] = [];
                  // Try to get from paymentInfo if available
                  if (paymentInfo && paymentInfo.items) {
                    try {
                      orderItems = typeof paymentInfo.items === 'string' ? JSON.parse(paymentInfo.items) : paymentInfo.items;
                    } catch {}
                  }
                  // Fallback: try to get from localStorage (last order)
                  if (!orderItems.length) {
                    const lastOrder = localStorage.getItem('stepstunnerOrderHistory');
                    if (lastOrder) {
                      try {
                        const parsed = JSON.parse(lastOrder);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          orderItems = parsed[0].items || [];
                        }
                      } catch {}
                    }
                  }
                  // Fallback: try to get from localStorage (last placed order items)
                  if (!orderItems.length) {
                    const lastPlaced = localStorage.getItem('stepstunnerLastOrderItems');
                    if (lastPlaced) {
                      try {
                        orderItems = JSON.parse(lastPlaced);
                      } catch {}
                    }
                  }
                  
                  if (!orderItems.length) {
                    return (
                      <Typography variant="body1" sx={{ color: '#666', fontStyle: 'italic' }}>
                        Your special gift is being prepared with love and care!
                      </Typography>
                    );
                  }
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {orderItems.map((item, idx) => (
                        <Card key={idx} sx={{
                          background: 'white',
                          border: '1px solid #ffd6e7',
                          borderRadius: 3,
                          p: 3,
                          opacity: 0,
                          transform: 'translateY(20px)',
                          animation: `slideInUp 0.6s ${0.2 + idx * 0.15}s ease-out forwards`,
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(215, 38, 96, 0.15)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #ff6b9d 0%, #ffb3d1 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Favorite sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#333' }}>
                                {item.name || 'Special Gift'}
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1, color: '#666', lineHeight: 1.6 }}>
                                {getWhySpecialMessage(item)}
                              </Typography>
                              {item.customMessage && (
                                <Chip 
                                  label={`"${item.customMessage}"`}
                                  sx={{ 
                                    bgcolor: '#fff5f7', 
                                    color: '#d72660',
                                    fontStyle: 'italic',
                                    border: '1px solid #ffb3d1'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  );
                })()}
              </Box>
            </Card>

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