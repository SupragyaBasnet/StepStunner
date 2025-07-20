import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        color: '#111',
        py: 6,
        mt: 8,
        borderTop: '1px solid #eee',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: '#111', fontWeight: 700, mb: 2 }}>
              StepStunner
            </Typography>
            <Typography variant="body2" sx={{ color: '#111', mb: 1 }}>
              Step into style with our premium collection of women's sneakers. From casual to athletic, we offer comfort and fashion for every step.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: '#111', fontWeight: 700, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ color: '#111' }}>
                Home
              </Link>
              <Link href="/products" color="inherit" underline="hover" sx={{ color: '#111' }}>
                Products
              </Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ color: '#111' }}>
                About Us
              </Link>
              <Link href="/cart" color="inherit" underline="hover" sx={{ color: '#111' }}>
                Cart
              </Link>
              <Link href="/help" color="inherit" underline="hover" sx={{ color: '#111' }}>
                Help
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ color: '#111' }}>
                Contact Us
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: '#111', fontWeight: 700, mb: 2 }}>
              Our Values
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#111', mb: 1 }}>• Customer Delight</Typography>
              <Typography variant="body2" sx={{ color: '#111', mb: 1 }}>• Creativity & Personalization</Typography>
              <Typography variant="body2" sx={{ color: '#111', mb: 1 }}>• Quality & Trust</Typography>
              <Typography variant="body2" sx={{ color: '#111', mb: 1 }}>• Fast & Friendly Service</Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" align="center" sx={{ color: '#111' }}>
            © {new Date().getFullYear()} StepStunner. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 