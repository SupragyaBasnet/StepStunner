import React, { useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!recaptchaToken) {
      setError('Please complete the CAPTCHA');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setSuccess('If this email exists, an OTP has been sent.');
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Forgot Password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSendOtp}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <ReCAPTCHA
                  sitekey="6LesJYsrAAAAAM6slcdSbytahY5L87k2N_1uXyyE"
                  ref={recaptchaRef}
                  onChange={(token) => setRecaptchaToken(token || '')}
                  size="normal"
                />
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !email || !recaptchaToken}
              >
                Send OTP
              </Button>
            </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 