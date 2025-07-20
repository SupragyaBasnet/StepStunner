import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();
  console.log('Cart items from context:', cartItems);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const user = localStorage.getItem('stepstunnerUser');
    if (!token || !user) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  if (cartItems.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2rem', md: '2.5rem' }, 
              color: '#1a1a1a',
              mb: 2,
              background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Your Cart is Empty
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontWeight: 400,
              mb: 4,
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            Start adding some amazing personalized gifts to your cart!
          </Typography>
          <Button
            variant="contained"
            size="medium"
            component={RouterLink}
            to="/products"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              width: { xs: '100%', sm: 250 },
              background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
              boxShadow: '0 6px 20px rgba(215, 38, 96, 0.3)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #b71c4a 0%, #8e1a3a 100%)',
                boxShadow: '0 8px 25px rgba(215, 38, 96, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Browse Products
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      py: { xs: 3, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2rem', md: '2.5rem' }, 
              color: '#1a1a1a',
              mb: 1,
              background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Your Cart
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontWeight: 400,
              mb: 2
            }}
          >
            Review your items and proceed to checkout
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => {
              // Determine display values based on type
              const isCustom = item.type === 'custom';
              const displayName = isCustom
                ? (item.customization?.productType ? `${item.customization.productType.charAt(0).toUpperCase() + item.customization.productType.slice(1)}` : 'Custom Product')
                : (item.name || 'Product');
              const displayImage = isCustom
                ? (item.image || item.customization?.image || '/placeholder.png')
                : (item.image || '/placeholder.png');
            return (
              <Card 
                key={item.cartItemId || item.id} 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                    zIndex: 1
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ 
                        bgcolor: '#fafafa',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 80
                      }}>
                        <CardMedia
                          component="img"
                          height="70"
                          image={displayImage}
                          alt={displayName}
                          sx={{ 
                            objectFit: 'contain',
                            borderRadius: 1,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#1a1a1a',
                          mb: 1
                        }}
                      >
                        {displayName}
                      </Typography>
                      
                      {/* Quantity Controls */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        bgcolor: '#f8f9fa',
                        borderRadius: 1,
                        p: 0.5,
                        width: 'fit-content'
                      }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          sx={{ 
                            minWidth: 32, 
                            height: 32,
                            borderRadius: 1,
                            borderColor: '#d72660',
                            color: '#d72660',
                            fontSize: '0.9rem',
                            '&:hover': {
                              borderColor: '#b71c4a',
                              backgroundColor: 'rgba(215, 38, 96, 0.1)'
                            },
                            '&:disabled': {
                              borderColor: '#ccc',
                              color: '#ccc'
                            }
                          }}
                        >
                          -
                        </Button>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mx: 2, 
                            fontWeight: 600,
                            color: '#333',
                            minWidth: 60,
                            textAlign: 'center'
                          }}
                        >
                          Qty: {item.quantity}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                          disabled={item.quantity >= 10}
                          sx={{ 
                            minWidth: 32, 
                            height: 32,
                            borderRadius: 1,
                            borderColor: '#d72660',
                            color: '#d72660',
                            fontSize: '0.9rem',
                            '&:hover': {
                              borderColor: '#b71c4a',
                              backgroundColor: 'rgba(215, 38, 96, 0.1)'
                            },
                            '&:disabled': {
                              borderColor: '#ccc',
                              color: '#ccc'
                            }
                          }}
                        >
                          +
                        </Button>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          mb: 1,
                          fontWeight: 500
                        }}
                      >
                        Item Total: Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/checkout?singleItemId=' + (item.cartItemId || item.id), { state: { items: [{ ...item, total: item.price * item.quantity }] } })}
                        sx={{
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          width: 120,
                          fontSize: '0.9rem',
                          background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                          boxShadow: '0 2px 8px rgba(215, 38, 96, 0.3)',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #b71c4a 0%, #8e1a3a 100%)',
                            boxShadow: '0 4px 12px rgba(215, 38, 96, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Buy Now
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 1
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#d72660', 
                            fontWeight: 700,
                            fontSize: '1.2rem'
                          }}
                        >
                          Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{
                            bgcolor: '#fff5f5',
                            color: '#d72660',
                            border: '1px solid #d72660',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: '#d72660',
                              color: 'white',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 32,
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  borderBottom: '2px solid #d72660',
                  pb: 1,
                  mb: 2
                }}
              >
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#333' }}>
                      Rs. {getTotalPrice().toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
              <Box sx={{ mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      Total
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#d72660' }}>
                      Rs. {getTotalPrice().toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Button
                variant="contained"
                size="medium"
                fullWidth
                component={RouterLink}
                to="/checkout"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1.5,
                  borderRadius: 2,
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
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

export default Cart; 