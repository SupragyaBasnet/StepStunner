import { Payment as PaymentIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Rating, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImagePath, getFallbackImage } from '../utils/imageUtils';

// Import the new CustomizedProductImage component

// Import payment logos
import esewaLogo from '../assets/esewa_logo.jpg'; // Assuming path and filename

// Simple client-side price map (placeholder) - Needed for calculating subtotal and delivery charge
const productPrices: Record<string, number> = {
  tshirt: 500,
  mug: 300,
  phonecase: 800,
  waterbottle: 600,
  cap: 400,
  notebook: 700,
  pen: 200,
  keychain: 200,
  frame: 3000,
  pillowcase: 900,
};

// Delivery charge by city (Nepal major cities)
const CITY_DELIVERY_CHARGES: { [city: string]: number } = {
  'Kathmandu': 100,
  'Lalitpur': 120,
  'Bhaktapur': 150,
  'Pokhara': 200,
  'Biratnagar': 250,
  'Birgunj': 250,
  'Butwal': 220,
  'Dharan': 230,
  'Bharatpur': 180,
  'Janakpur': 260,
  'Hetauda': 200,
  'Nepalgunj': 300,
  'Dhangadhi': 350,
  'Itahari': 240,
  'Ghorahi': 320,
  'Tulsipur': 320,
  'Bhimdatta': 350,
  'Damak': 250,
  'Gorkha': 280,
  'Siddharthanagar': 220,
  'Tikapur': 340,
  'Rajbiraj': 270,
  'Lahan': 270,
  'Panauti': 160,
  'Kirtipur': 130,
  'Banepa': 170,
  'Dhulikhel': 180,
  'Bhadrapur': 300,
  'Ilam': 320,
  'Baglung': 300,
  'Beni': 320,
  'Damauli': 250,
  'Tansen': 280,
  'Palpa': 280,
  'Jaleshwar': 270,
  'Kalaiya': 260,
  'Parasi': 250,
  'Siraha': 270,
  'Gaighat': 270,
  'Inaruwa': 260,
  'Khandbari': 350,
  'Phidim': 350,
  'Dipayal': 400,
  'Amargadhi': 400,
  'Sandhikharka': 350,
  'Chainpur': 400,
  'Darchula': 450,
  'Jumla': 500,
  'Simikot': 600,
  'Other': 400
};

function getDeliveryCharge(address: string): number {
  for (const city in CITY_DELIVERY_CHARGES) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return CITY_DELIVERY_CHARGES[city];
    }
  }
  return CITY_DELIVERY_CHARGES['Other'];
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const { cartItems, getTotalPrice, removeFromCart, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [orderConfirmedMessage, setOrderConfirmedMessage] = useState('');
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(100);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Check authentication and initialize
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const user = localStorage.getItem('stepstunnerUser');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    // Set loading to false after a short delay to ensure cart context is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Get singleItemId from URL if present
  const urlParams = new URLSearchParams(location.search);
  const singleItemId = urlParams.get('singleItemId');

  // Determine items to checkout
  let itemsToCheckout = location.state?.items || cartItems || [];
  
  // If singleItemId is present, find that specific item
  if (singleItemId && itemsToCheckout.length > 0) {
    const singleItem = itemsToCheckout.find((item: any) => 
      item.id === singleItemId || 
      item._id === singleItemId || 
      item.cartItemId === singleItemId
    );
    if (singleItem) {
      itemsToCheckout = [singleItem];
    }
  }

  // Calculate subtotal and total
  const subtotal = itemsToCheckout.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryCharge;

  // Debug logging
  console.log('CheckoutPage Debug:', {
    locationState: location.state,
    cartItems,
    singleItemId,
    itemsToCheckout,
    subtotal,
    total
  });

  // Address and payment logic
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
    setAddressError('');
  };
  const validateAddress = () => {
    if (!address.trim()) {
      setAddressError('Address is required');
      return false;
    }
    return true;
  };
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };
  const isConfirmButtonEnabled = address.trim() !== '' && selectedPaymentMethod !== null;

  // Order confirmation logic
  const handleConfirmOrder = async () => {
    // Robust validation for required fields
    if (!address.trim()) {
      setAddressError('Address is required');
      return;
    }
    if (!selectedPaymentMethod) {
      setOrderConfirmedMessage('Please select a payment method.');
      return;
    }
    // Transform items for backend
    const items = await Promise.all(itemsToCheckout.map(async (item: any) => {
      // Fallback: treat as custom if customizationId is present
      if (item.type === 'custom' || (!!item.customizationId && !item.product)) {
        if (!item.customizationId || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
          setOrderConfirmedMessage('Custom item is missing required fields.');
          throw new Error('Custom item missing required fields');
        }
        return {
          customizationId: item.customizationId,
          customization: item.customization,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          name: item.customization?.productType || 'Custom Product',
        };
      } else {
        if (!item.product?._id && !item.id && !item._id) {
          setOrderConfirmedMessage('Product item is missing required fields.');
          throw new Error('Product item missing required fields');
        }
        return {
          product: item.product?._id || item.id || item._id,
          quantity: item.quantity,
          price: item.price,
          image: item.image || item.product?.image,
          name: item.product?.name || item.name,
        };
      }
    }));
    // Validate total
    if (typeof total !== 'number' || isNaN(total) || total <= 0) {
      setOrderConfirmedMessage('Order total is invalid.');
      return;
    }
    try {
      const res = await fetch('/api/products/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('stepstunnerToken')}`,
        },
        body: JSON.stringify({ items, total, address, paymentMethod: selectedPaymentMethod }),
      });
      if (!res.ok) throw new Error('Failed to place order');

      if (selectedPaymentMethod === 'eSewa') {
        // Save order items to localStorage for confirmation page
        localStorage.setItem('stepstunnerLastOrderItems', JSON.stringify(items));
        // Call backend to get eSewa payment URL
        const esewaRes = await fetch('/api/auth/payment/esewa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ total }),
        });
        const esewaData = await esewaRes.json();
        if (esewaData.url) {
          window.location.href = esewaData.url; // Redirect to eSewa
          return;
        } else {
          setOrderConfirmedMessage('Failed to initiate eSewa payment.');
          return;
        }
      }

      // Update cart context for COD before redirect
      const singleItemId = itemsToCheckout.length === 1 ? itemsToCheckout[0].cartItemId : undefined;
      // Save order items to localStorage for confirmation page (COD)
              localStorage.setItem('stepstunnerLastOrderItems', JSON.stringify(items));
      if (singleItemId) {
        // Find the cart item and remove by product id
        const cartItem = cartItems.find((item) => item.cartItemId === singleItemId || item.id === singleItemId);
        if (cartItem) {
          await removeFromCart(cartItem.id);
        } else {
          await removeFromCart(singleItemId);
        }
        navigate(`/orderconfirmed?singleItemId=${singleItemId}`);
      } else {
        await clearCart();
        navigate('/orderconfirmed');
      }
    } catch (err) {
      setOrderConfirmedMessage('Failed to place order. Please check your details and try again.');
    }
  };

  // Handle opening and closing the review modal
  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
    setReviewText(''); // Clear review text on close
    setReviewRating(null); // Clear rating on close
  };

  // Handle submitting the review
  const handleSubmitReview = () => {
    console.log('Submitted Review:', { review: reviewText, rating: reviewRating }); // Log review and rating

    // Get existing order history from localStorage
            const existingOrderHistory = localStorage.getItem('stepstunnerOrderHistory');
    let orderHistory = existingOrderHistory ? JSON.parse(existingOrderHistory) : [];

    // Find the most recent order (assuming the review is for the last placed order)
    // In a real app, you might associate the review with a specific order ID
    const mostRecentOrderIndex = orderHistory.length > 0 ? orderHistory.length - 1 : -1;

    if (mostRecentOrderIndex !== -1) {
      // Update the review and rating for the most recent order
      orderHistory[mostRecentOrderIndex].review = reviewText;
      orderHistory[mostRecentOrderIndex].rating = reviewRating;

      // Save the updated order history back to localStorage
              localStorage.setItem('stepstunnerOrderHistory', JSON.stringify(orderHistory));
      console.log('Review added to most recent order in localStorage.'); // Log success
    } else {
      console.error('No recent order found in localStorage to add review.'); // Log error if no orders
    }

    // In a real app, you would send this review and rating to your backend
    handleCloseReviewModal(); // Close modal after submission
    // Optionally clear the checkout item from localStorage if a review is the final step
    // localStorage.removeItem('giftcraftCheckoutItem'); // This is now handled in handleConfirmOrder
  };

  useEffect(() => {
    setDeliveryCharge(getDeliveryCharge(address));
  }, [address]);

  if (isLoading) {
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
              fontWeight: 700, 
              color: '#d72660',
              mb: 2
            }}
          >
            Loading Checkout...
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Please wait while we prepare your order.
          </Typography>
        </Container>
      </Box>
    );
  }

  if (!itemsToCheckout || itemsToCheckout.length === 0) {
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
              fontWeight: 700, 
              color: '#d72660',
              mb: 2
            }}
          >
            No items to checkout
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Please add some items to your cart first.
          </Typography>
          <Button
            variant="contained"
            size="medium"
            onClick={() => navigate('/products')}
            sx={{
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
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
          {!orderConfirmedMessage && (
            <Typography 
              variant="h2" 
              component="h1" 
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
              Proceed to Checkout
            </Typography>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontWeight: 400,
              mb: 3
            }}
          >
            Complete your purchase securely
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
        {orderConfirmedMessage ? (
          <Box sx={{ textAlign: 'center', mt: 3, opacity: 0, animation: 'fadeIn 0.5s ease-in-out forwards', '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }}>
            {orderConfirmedMessage.toLowerCase().includes('failed') ? (
              <Alert severity="error" sx={{ mb: 2 }}>{orderConfirmedMessage}</Alert>
            ) : (
              <>
            <Confetti width={window.innerWidth} height={window.innerHeight} />
            <Typography variant="h5" color="success.main" fontWeight={700} gutterBottom>
              Order Confirmed!
            </Typography>
            {orderConfirmedMessage.split('\n\n').map((paragraph, index) => (
              <Typography key={index} variant="body1" gutterBottom={index < orderConfirmedMessage.split('\n\n').length - 1}>
                {paragraph}
              </Typography>
            ))}
              </>
            )}
          </Box>
        ) : (
          <>
            {/* Item Details Summary */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid #f0f0f0' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  mb: 3,
                  borderBottom: '2px solid #d72660',
                  pb: 1,
                  display: 'inline-block'
                }}
              >
                Item Summary
              </Typography>
              {itemsToCheckout.map((item: any) => (
                <Box 
                  key={item.id || item._id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    p: 2,
                    bgcolor: '#fafafa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={getImagePath(item.image)} 
                      alt={item.name} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImage();
                      }}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        borderRadius: 1
                      }} 
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a1a1a',
                        mb: 1
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#666',
                        fontWeight: 500
                      }}
                    >
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#d72660',
                        fontWeight: 700,
                        mt: 1
                      }}
                    >
                      Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            {/* Price Breakdown */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid #f0f0f0' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  mb: 3,
                  borderBottom: '2px solid #d72660',
                  pb: 1,
                  display: 'inline-block'
                }}
              >
                Order Summary
              </Typography>
              <Box sx={{ 
                bgcolor: '#fafafa',
                p: 3,
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    Subtotal:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    Rs. {subtotal.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    Delivery Charge:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    Rs. {deliveryCharge}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2, borderColor: '#d72660' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Total:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#d72660' }}>
                    Rs. {total.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {/* Address Section */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid #f0f0f0' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  mb: 3,
                  borderBottom: '2px solid #d72660',
                  pb: 1,
                  display: 'inline-block'
                }}
              >
                Delivery Address
              </Typography>
              {addressError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {addressError}
                </Alert>
              )}
              <Box sx={{ mt: 2 }}>
                <TextField
                  required
                  label="Delivery Address"
                  value={address}
                  onChange={handleAddressChange}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Enter your complete delivery address"
                  error={!!addressError}
                  helperText={addressError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d72660',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d72660',
                      },
                    },
                  }}
                />
              </Box>
            </Box>
            {/* Payment Methods Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  mb: 3,
                  borderBottom: '2px solid #d72660',
                  pb: 1,
                  display: 'inline-block'
                }}
              >
                Choose Payment Method
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 2 }}>
                {/* eSewa */}
                <Card 
                  elevation={0} 
                  sx={{
                    border: selectedPaymentMethod === 'eSewa' ? '2px solid #d72660' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    bgcolor: selectedPaymentMethod === 'eSewa' ? '#fff5f5' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#d72660',
                      boxShadow: '0 4px 12px rgba(215, 38, 96, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardActionArea onClick={() => handlePaymentMethodSelect('eSewa')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                      <Box sx={{ 
                        width: 50, 
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white',
                        borderRadius: 2,
                        p: 1
                      }}>
                        <Box 
                          component="img" 
                          src={esewaLogo} 
                          alt="eSewa Logo" 
                          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          eSewa
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Digital Wallet
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>

                {/* Cash on Delivery */}
                <Card 
                  elevation={0} 
                  sx={{
                    border: selectedPaymentMethod === 'Cash on Delivery' ? '2px solid #d72660' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    bgcolor: selectedPaymentMethod === 'Cash on Delivery' ? '#fff5f5' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#d72660',
                      boxShadow: '0 4px 12px rgba(215, 38, 96, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardActionArea onClick={() => handlePaymentMethodSelect('Cash on Delivery')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        bgcolor: '#d72660', 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <PaymentIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          Cash on Delivery
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Pay when you receive
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Box>
            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large" 
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  width: { xs: '100%', sm: 300 },
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #d72660 0%, #b71c4a 100%)',
                  boxShadow: '0 8px 32px rgba(215, 38, 96, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #b71c4a 0%, #8e1a3a 100%)',
                    boxShadow: '0 12px 40px rgba(215, 38, 96, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    boxShadow: 'none',
                    transform: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
                disabled={!isConfirmButtonEnabled || isRedirecting}
                onClick={handleConfirmOrder}
              >
                {isRedirecting
                  ? selectedPaymentMethod === 'eSewa'
                    ? 'Redirecting to eSewa...'
                    : 'Processing...'
                  : 'Confirm Order'}
              </Button>
            </Box>
          </>
        )}
        </Paper>

        {/* Review Modal */}
        <Dialog open={openReviewModal} onClose={handleCloseReviewModal}>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography component="legend">Your Rating</Typography>
              <Rating
                name="review-rating"
                value={reviewRating}
                onChange={(event, newValue) => {
                  setReviewRating(newValue);
                }}
              />
              <TextField
                autoFocus
                margin="dense"
                label="Your Review"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReviewModal} color="secondary">Cancel</Button>
            <Button onClick={handleSubmitReview} color="primary" disabled={!reviewText.trim() || reviewRating === null}>Submit Review</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CheckoutPage; 