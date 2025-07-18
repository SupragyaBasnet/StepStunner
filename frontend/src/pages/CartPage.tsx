import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';

import { Add, Remove } from '@mui/icons-material';
import { useCart } from '../context/CartContext';

// Simple client-side price map (placeholder)
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

// Placeholder delivery charge
const DELIVERY_CHARGE = 100; // Example fixed delivery charge

const CartPage: React.FC = () => {
  // Remove local cartItems state
  // const [cartItems, setCartItems] = useState<any[]>([]);
  const [openPayment, setOpenPayment] = useState(false); // State for payment dialog
  const navigate = useNavigate();
  const { cartItems, updateQuantity } = useCart();

  // Calculate total price including delivery charge
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const total = subtotal + (subtotal > 0 ? DELIVERY_CHARGE : 0); // Add delivery charge only if there are items

  useEffect(() => {
    const savedCart = localStorage.getItem('stepstunnerCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart).map((item: any) => ({ ...item, quantity: item.quantity || 1 })); // Ensure quantity exists
        // setCartItems(parsedCart);
        console.log('Cart data loaded from localStorage:', parsedCart); // Log loaded data
      } catch (e) {
        console.error('Failed to load cart data from localStorage', e);
        // Optionally clear invalid data
        localStorage.removeItem('stepstunnerCart');
      }
    } else {
       console.log('No cart data found in localStorage.'); // Log if no data found
    }
  }, []); // Empty dependency array means this effect runs only once on mount



  const handleBuyNow = () => {
    // Navigate to checkout and pass cartItems as state
    navigate('/checkout', { state: { items: cartItems } });
  };

  // Handle Buy Now for a single item
  const handleBuyNowItem = (item: any) => {
     console.log('Initiating Buy Now for single item:', item); // Log item for demonstration
     // In a real application, this would initiate a checkout process for just this item
     // Save the item to localStorage for the checkout page
             localStorage.setItem('stepstunnerCheckoutItem', JSON.stringify(item));
     // Navigate to the new checkout page
     navigate('/checkout'); // Assuming your checkout route is '/checkout'
     // setOpenPayment(true); // Open the payment dialog (placeholder) - No longer needed here
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={900} gutterBottom align="center">
          Your Cart
        </Typography>
        <Box>
          {cartItems.length === 0 ? (
            <Typography variant="body1" align="center">Your cart is empty.</Typography>
          ) : (
            <List>
              {cartItems.map((item, index) => (
                <ListItem key={item.id || index}>
                  <ListItemAvatar>
                    <Avatar
                      src={item.image}
                      sx={{ width: 80, height: 80, mr: 2 }}
                      variant="rounded"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {item.name || 'Product'}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        {/* Display individual product price */}
                        <Typography component="span" variant="body2" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                          Rs. {item.price || 0}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {/* Add quantity controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <IconButton size="small" onClick={async () => { await updateQuantity(item.id, Math.max(1, item.quantity - 1)); }} disabled={item.quantity <= 1}>
                      <Remove />
                    </IconButton>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={item.quantity}
                      onChange={e => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val)) val = 1;
                        val = Math.max(1, Math.min(10, val));
                        updateQuantity(item.id, val);
                      }}
                      onBlur={e => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val)) val = 1;
                        val = Math.max(1, Math.min(10, val));
                        updateQuantity(item.id, val);
                      }}
                      style={{ width: 48, textAlign: 'center', margin: '0 8px', borderRadius: 4, border: '1px solid #ccc', height: 32 }}
                    />
                    <IconButton size="small" onClick={async () => { await updateQuantity(item.id, Math.min(10, item.quantity + 1)); }} disabled={item.quantity >= 10}>
                      <Add />
                    </IconButton>
                  </Box>
                   {/* Add individual Buy Now button */}
                   <Box sx={{ ml: 2 }}>
                     <Button
                       variant="contained"
                       color="primary"
                       size="small"
                       onClick={() => handleBuyNowItem(item)}
                       sx={{ borderRadius: 8, fontWeight: 700, px: 2 }}
                     >
                       Buy Now
                     </Button>
                   </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        {/* Display Subtotal, Delivery Charge, and Total */}
        {cartItems.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Subtotal: Rs. {subtotal}
            </Typography>
             {subtotal > 0 && (
              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                 Delivery Charge: Rs. {DELIVERY_CHARGE}
              </Typography>
             )}
            <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
              Total: Rs. {total}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleBuyNow}
              sx={{ borderRadius: 8, fontWeight: 700, px: 4 }}
            >
              Buy Now (All Items)
            </Button>
          </Box>
        )}

      </Paper>
      {/* Payment Dialog (basic placeholder) */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)}>
        <DialogTitle>Choose Payment Method</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button variant="outlined" fullWidth>eSewa</Button>
            <Button variant="outlined" fullWidth>Khalti</Button>
            <Button variant="outlined" fullWidth>Cash on Delivery</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayment(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage; 