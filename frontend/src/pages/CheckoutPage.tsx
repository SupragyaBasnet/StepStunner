import { Payment as PaymentIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Rating, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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

  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('stepstunnerToken');
    const user = localStorage.getItem('stepstunnerUser');
    if (!token || !user) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Determine items to checkout
  const itemsToCheckout = location.state?.items || cartItems;

  // Calculate subtotal and total
  const subtotal = itemsToCheckout.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  
  // Apply 20% discount for purchases of 5000 or more
  const discountThreshold = 5000;
  const discountPercentage = 0.20; // 20%
  const discountAmount = subtotal >= discountThreshold ? subtotal * discountPercentage : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const total = subtotalAfterDiscount + deliveryCharge;

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

  if (!itemsToCheckout || itemsToCheckout.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">No items to checkout.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
        {!orderConfirmedMessage && (
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.2rem' }, color: '#111', mb: 0 }}>
            Proceed to Checkout
          </Typography>
        )}
        <div className="heading-dash" />
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
            <Box sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Item Summary:</Typography>
              {itemsToCheckout.map((item: any) => (
                <Box key={item.id || item._id} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ width: 80, height: 80, mr: 2 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
                    <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            {/* Price Breakdown */}
            <Box sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Order Summary:</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">Rs. {subtotal}</Typography>
              </Box>
              {discountAmount > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body1" color="success.main" fontWeight={600}>
                      Discount (20% off on Rs. 5000+):
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight={600}>
                      -Rs. {discountAmount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body1">Subtotal after discount:</Typography>
                    <Typography variant="body1">Rs. {subtotalAfterDiscount}</Typography>
                  </Box>
                </>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body1">Delivery Charge:</Typography>
                <Typography variant="body1">Rs. {deliveryCharge}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="h6" fontWeight={700}>Total:</Typography>
                <Typography variant="h6" fontWeight={700}>Rs. {total}</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'success.light', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.main'
                }}>
                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                    🎉 You saved Rs. {discountAmount} with our 20% discount offer!
                  </Typography>
                </Box>
              )}
            </Box>
            {/* Address Section */}
            <Box sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Delivery Address:</Typography>
              {addressError && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
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
                />
              </Box>
            </Box>
            {/* Payment Methods Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Choose Payment Method:</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                {/* eSewa */}
                <Card 
                  elevation={2} 
                  sx={{
                    border: selectedPaymentMethod === 'eSewa' ? '2px solid #F46A6A' : '1px solid #eee', // Highlight selected
                    '&:hover': {
                      borderColor: '#F46A6A',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea onClick={() => handlePaymentMethodSelect('eSewa')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                      {/* Use actual logo */}
                      <Box sx={{ 
                        width: 40, 
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Box 
                          component="img" 
                          src={esewaLogo} 
                          alt="eSewa Logo" 
                          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>eSewa</Typography>
                        <Typography variant="body2" color="text.secondary">Digital Wallet</Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>

                {/* Cash on Delivery */}
                <Card 
                  elevation={2} 
                  sx={{
                    border: selectedPaymentMethod === 'Cash on Delivery' ? '2px solid #F46A6A' : '1px solid #eee', // Highlight selected
                    '&:hover': {
                      borderColor: '#F46A6A',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea onClick={() => handlePaymentMethodSelect('Cash on Delivery')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                      {/* Use placeholder icon for COD */}
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: '#2E7D32', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <PaymentIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>Cash on Delivery</Typography>
                        <Typography variant="body2" color="text.secondary">Pay when you receive</Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Box>
            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large" 
                sx={{
                  mt: 3,
                  backgroundColor: 'rgb(255,106,106)',
                  '&:hover': { backgroundColor: 'rgb(220,80,80)' },
                  maxWidth: 320,
                  fontWeight: 700,borderRadius: 7,width:200,
                  alignSelf: 'center'
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
          <Button onClick={handleSubmitReview} color="primary" disabled={!reviewText.trim() || reviewRating === null}>Submit Review</Button> {/* Disable submit if no rating or review text */}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage; 