import React from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

const Contact: React.FC = () => {
  return (
    <Box sx={{minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 4px 24px rgba(224,85,85,0.18)', mt: 6, mb: 2, textAlign: 'center', width: '100%', maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.2rem' }, color: '#111', mb: 0 }}>
            Contact Us
          </Typography> 
          <div className="heading-dash" />
         
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', justifyContent: 'center', gap: 4, mb: 2, mt: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(244,106,106,0.07)', borderRadius: 3, p: 2.5, minWidth: 220, maxWidth: 240, minHeight: 140, boxShadow: '0 2px 8px rgba(224,85,85,0.06)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>Call us</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Phone sx={{ color: 'rgb(244,106,106)', fontSize: 24 }} />
                <a href="tel:+9779816315056" className="contact-link" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#222' }}>+977 9816315056</a>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>We're available during business hours for your calls.</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(244,106,106,0.07)', borderRadius: 3, p: 2.5, minWidth: 220, maxWidth: 240, minHeight: 140, boxShadow: '0 2px 8px rgba(224,85,85,0.06)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>Email us</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Email sx={{ color: 'rgb(244,106,106)', fontSize: 24 }} />
                <a href="mailto:info@stepstunner.com" className="contact-link" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#222' }}>info@stepstunner.com</a>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Send us your questions or feedback anytime.</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(244,106,106,0.07)', borderRadius: 3, p: 2.5, minWidth: 220, maxWidth: 240, minHeight: 140, boxShadow: '0 2px 8px rgba(224,85,85,0.06)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>Visit us</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LocationOn sx={{ color: 'rgb(244,106,106)', fontSize: 24 }} />
                <a href="https://www.google.com/maps/search/?api=1&query=Dhumrabari,+Kathmandu" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#222' }}>Dhumrabarahi, Kathmandu</a>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>Find us at our Kathmandu office for in-person help.</Typography>
            </Box>
           
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Business hours: 9:00 AM - 5:00 PM, Sunday to Friday
        </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Contact; 