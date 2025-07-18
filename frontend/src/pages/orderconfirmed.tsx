import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { base64Decode } from 'esewajs';
import Confetti from 'react-confetti';
import { useCart } from '../context/CartContext';

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
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Verifying payment...</Typography>
      </Container>
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
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={250} recycle={false} />
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, width: '100%', maxWidth: 500, textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" color="success.main" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Order Confirmed!
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Thank you for your order. Your payment was successful and your order has been placed!
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}
        {paymentInfo && (
          <Box sx={{ mb: 4, p: { xs: 2, md: 3 }, border: '1px solid #eee', borderRadius: 2, background: '#f9f9f9', textAlign: 'left', overflowX: 'auto' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textAlign: 'center' }}>Transaction Details:</Typography>
            {Object.entries(paymentInfo).map(([key, value]) => (
              <Typography key={key} variant="body2" sx={{ wordBreak: 'break-all' }}>
                <strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}
              </Typography>
            ))}
          </Box>
        )}
        {/* Why this gift is special section */}
        <Box sx={{ mt: 3, mb: 2, textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'visible', background: '#fff6f6', borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: '0 2px 12px 0 rgba(244,106,106,0.06)' }}>
          {/* Row of pulsing hearts above the title */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, gap: 1 }}>
            {[0,1,2,3,4,5,6].map((i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontSize: 32,
                  color: '#F46A6A',
                  margin: '0 2px',
                  animation: `heartPulseRow 1.4s ${i * 0.12}s infinite cubic-bezier(.4,1.4,.6,1)`,
                  filter: 'drop-shadow(0 2px 8px #F46A6A22)',
                }}
              >
                ❤️
              </span>
            ))}
            <style>{`
              @keyframes heartPulseRow {
                0% { transform: scale(1); opacity: 0.85; }
                30% { transform: scale(1.18); opacity: 1; }
                60% { transform: scale(0.92); opacity: 0.85; }
                100% { transform: scale(1); opacity: 0.85; }
              }
            `}</style>
          </Box>
          {/* Side hearts */}
          <Box sx={{ position: 'absolute', left: -28, top: 32, zIndex: 0 }}>
            <span style={{ fontSize: 32, color: '#F46A6A', opacity: 0.18, animation: 'sideHeartFade 2.2s 0.2s infinite alternate' }}>❤️</span>
          </Box>
          <Box sx={{ position: 'absolute', left: -22, bottom: 32, zIndex: 0 }}>
            <span style={{ fontSize: 22, color: '#F46A6A', opacity: 0.13, animation: 'sideHeartFade 2.2s 0.7s infinite alternate' }}>❤️</span>
          </Box>
          <Box sx={{ position: 'absolute', right: -28, top: 32, zIndex: 0 }}>
            <span style={{ fontSize: 32, color: '#F46A6A', opacity: 0.18, animation: 'sideHeartFade 2.2s 0.4s infinite alternate' }}>❤️</span>
          </Box>
          <Box sx={{ position: 'absolute', right: -22, bottom: 32, zIndex: 0 }}>
            <span style={{ fontSize: 22, color: '#F46A6A', opacity: 0.13, animation: 'sideHeartFade 2.2s 1.1s infinite alternate' }}>❤️</span>
          </Box>
          <style>{`
            @keyframes sideHeartFade {
              0% { opacity: 0.13; }
              50% { opacity: 0.28; }
              100% { opacity: 0.13; }
            }
          `}</style>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2, textAlign: 'center', color: '#C62839', position: 'relative', zIndex: 1 }}>
            Why This Gift is Special
          </Typography>
          {/* Try to get order items from localStorage or paymentInfo */}
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
              return <Typography variant="body2">(Could not load order items.)</Typography>;
            }
            return orderItems.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #f3f3f3',
                  borderRadius: 3,
                  background: '#fff',
                  opacity: 0,
                  transform: 'translateY(24px)',
                  animation: `fadeInUp 0.7s ${0.2 + idx * 0.15}s cubic-bezier(.4,1.4,.6,1) forwards`,
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(24px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  {item.name || 'Product'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                  {getWhySpecialMessage(item)}
                </Typography>
                {item.customMessage && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#888' }}>
                    "{item.customMessage}"
                  </Typography>
                )}
              </Box>
            ));
          })()}
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          component={RouterLink} 
          to="/" 
          size="large" 
          sx={{ 
            mt: 2, 
            fontWeight: 700,borderRadius: 7,width:200,
            backgroundColor: 'rgb(255,106,106)', 
            '&:hover': { backgroundColor: 'rgb(220,80,80)' } 
          }}
        >
          GO TO HOME
        </Button>
      </Paper>
    </Container>
  );
};

export default OrderConfirmed; 