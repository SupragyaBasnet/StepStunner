import React from 'react';
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

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Start adding some amazing personalized gifts to your cart!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/products"
          sx={{
            
            fontWeight: 700,borderRadius: 7,width:200,
            backgroundColor: 'rgb(255,106,106)', 
            '&:hover': { backgroundColor: 'rgb(220,80,80)' } 
          }}
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.2rem' }, color: '#111', mb: 0 }}>
        Your Cart
      </Typography>
      <div className="heading-dash" />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => {
            // Determine display values based on type
            const isCustom = item.type === 'custom';
            const displayName = isCustom
              ? (item.customization?.productType ? `${item.customization.productType.charAt(0).toUpperCase() + item.customization.productType.slice(1)}` : 'Custom Product')
              : (item.product?.name || item.name || 'Product');
            const displayImage = isCustom
              ? (item.image || item.customization?.image || '/placeholder.png')
              : (item.image || item.product?.image || '/placeholder.png');
            return (
              <Card key={item.cartItemId || item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={displayImage}
                        alt={displayName}
                        sx={{ objectFit: 'contain' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">{displayName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          sx={{ minWidth: 32, px: 0 }}
                        >
                          -
                        </Button>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                          Quantity: {item.quantity}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                          disabled={item.quantity >= 10}
                          sx={{ minWidth: 32, px: 0 }}
                        >
                          +
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Item Total: Rs. {item.price * item.quantity}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{
                          mt: 1,
                          fontWeight: 700,borderRadius: 7,width:150,
                          backgroundColor: 'rgb(255,106,106)',
                          '&:hover': { backgroundColor: 'rgb(220,80,80)' }
                        }}
                        size="small"
                        onClick={() => navigate('/checkout?singleItemId=' + (item.cartItemId || item.id), { state: { items: [{ ...item, total: item.price * item.quantity }] } })}
                      >
                        Buy Now
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="h6" sx={{ color: '#000', fontWeight: 700 }}>
                          Rs. {item.price * item.quantity}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <DeleteIcon />
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography>Subtotal</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Rs. {getTotalPrice().toLocaleString('en-IN')}</Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">
                      Rs. {getTotalPrice().toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                component={RouterLink}
                to="/checkout"
                sx={{
                  fontWeight: 700,borderRadius: 7,
                  backgroundColor: 'rgb(255,106,106)',
                  '&:hover': { backgroundColor: 'rgb(220,80,80)' }
                }}
              >
               Buy Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart; 